/* global Event, FormData, FileReader */

import Menu from './Menu.js'
import Modal from './Modal.js'
import Gallery from './Gallery.js'
import ProgressBar from './ProgressBar.js'
import {
  API_URL,
  API_SAVE,
  API_UPLOAD,
  EVENT_LOADED,
  EVENT_LOADING,
  SELECTOR_TITLE,
  SELECTOR_NOTE
} from './Constants.js'
import {
  areObjectsEqual,
  htmlToElement,
  isDomNode,
  isHexColor,
  mergeSettings,
  preventDefaults,
  processContentEditable,
  stripExtension,
  removeHtml,
  Fetch
} from './Helpers.js'

/**
 * Provides editing capabilities
 * Acts as interface between UI and API
 */
class Editor {
  /**
   * Binds functions to Editor, initializes options
   * @param  {Object}   options
   * @param  {string}   options.dropAreaSelector
   * @param  {string}   options.fileInputSelector
   * @param  {string}   options.progressBarSelector
   * @param  {string}   options.buttonPreviewSelector
   * @param  {string}   options.fullscreenDropZone
   * @param  {string}   options.bgColor
   * @param  {string}   options.textColor
   * @param  {string}   options.fontFamily
   * @param  {Gallery}  options.gallery
   * @param  {function} options.onUpdate
   */
  constructor (options) {
    const defaults = {
      dropAreaSelector: '#drop-area',
      fileInputSelector: '#file-input',
      progressBarSelector: '.progress-bar',
      buttonPreviewSelector: '.editbutton.preview',
      gallery: new Gallery({
        gallerySelector: '.Gallery',
        imageSelector: '.Image',
        lazyloadSelector: '.lazy',
        active: false
      }),
      fullscreenDropZone: true,
      bgColor: '#bbb',
      textColor: '#333',
      fontFamily: document.body.style.fontFamily,
      onUpdate: (newData, oldData) => {}
    }
    this.options = mergeSettings(options, defaults)
    this.actionSave = this.actionSave.bind(this)
    this.actionCancel = this.actionCancel.bind(this)
    this.actionUpdate = this.actionUpdate.bind(this)
    this.files = []
    this.init(this.options)
  }

  /**
   * Initializer
   * @param  {Object} options
   */
  init (options) {
    const {
      bgColor,
      textColor,
      fontFamily,
      gallery,
      dropAreaSelector,
      fullscreenDropZone,
      fileInputSelector,
      progressBarSelector,
      onUpdate
    } = options

    this._gallery = gallery
    this._buttons = []
    this._dropArea = document.querySelector(dropAreaSelector)
    this._fileInput = document.querySelector(fileInputSelector)
    this._fullscreenDropZone = Boolean(fullscreenDropZone)

    if (!this._gallery) {
      console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No Gallery provided.\nResult: Editor can't initialize.`)
      return
    }
    if (!this._dropArea) {
      console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No drop area with selector [${dropAreaSelector}] found in document.\nResult: Editor can't initialize.`)
      return
    }
    if (!this._fileInput) {
      console.warn(`\nModule: Editor.js\nWarning: Can't create file input listener.\nCause: No file input with selector [${fileInputSelector}] found in document.\nResult: Upload by file input button is disabled.`)
    }
    this._progressbar = new ProgressBar(progressBarSelector)

    this._menu = new Menu()

    ;(() => new Modal({
      target: '.modal',
      active: true,
      triggers: '.modal__bg, .modal__close'
    }))()

    this.onUpdate = onUpdate
    this.bgColor = bgColor
    this.textColor = textColor
    this.fontFamily = fontFamily
    this._backup = this.getState()
    this.initListeners()
  }

  /**
   * Ties a button to the Editor's menu object
   * @param {Object} options refer to Menu class
   */
  addButton (options) {
    const button = this.menu.addButton(options)
    if (button) {
      this._buttons.push(button)
    }
  }

  initListeners () {
    // Prevent default drag behaviors
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this._dropArea.addEventListener(eventName, preventDefaults, false)
      document.body.addEventListener(eventName, preventDefaults, false)
    })

    if (this._fullscreenDropZone) {
      ;['dragenter'].forEach(eventName => {
        document.addEventListener(eventName, (e) => {
          this._dropArea.classList.add('active')
        }, true)
      })
      ;['dragleave', 'drop'].forEach(eventName => {
        this._dropArea.addEventListener(eventName, (e) => {
          this._dropArea.classList.remove('active')
        }, true)
      })
    }
    // Highlight drop area when item is dragged over it
    ;['dragenter', 'dragover'].forEach(eventName => {
      this._dropArea.addEventListener(eventName, () => {
        this.highlight()
      }, false)
    })

    ;['dragleave', 'drop'].forEach(eventName => {
      this._dropArea.addEventListener(eventName, () => {
        this.unhighlight()
      }, false)
    })

    // Handle dropped files
    this._dropArea.addEventListener('drop', (e) => {
      this.handleDrop(e)
    }, false)

    if (this._fileInput) {
      this._fileInput.addEventListener('change', (e) => {
        if (e.target && e.target.files) {
          this.handleFiles(e.target.files)
        }
      })
    }

    // Adding controls to images
    this._gallery.images.map(image => this.addControlsToImage(image))
  }

  /**
   * Given an image object, attaches menu buttons
   * @param {Image} image
   */
  addControlsToImage (image) {
    const deleteButton = this.getImageButton('╳', 'button--delete', image.getId())
    const revertButton = this.getImageButton('⏪', 'button--revert', image.getId())
    const imageControls = htmlToElement('<div class="Image__controls"></div>')

    imageControls.appendChild(deleteButton)
    imageControls.appendChild(revertButton)
    image.dom.appendChild(imageControls)
    this.menu.addButton({
      type: 'toggle',
      domNode: deleteButton,
      domNode2: revertButton,
      callback: this.editDeleteImage.bind(this),
      callback2: this.editRevertImage.bind(this)
    })
  }

  set bgColor (color) {
    if (isHexColor(color)) {
      this._bgColor = color
      document.body.style.backgroundColor = color
    }
  }

  get bgColor () {
    return this._bgColor
  }

  set textColor (color) {
    if (isHexColor(color)) {
      this._textColor = color
      document.body.style.color = color
    }
  }

  get textColor () {
    return this._textColor
  }

  set fontFamily (fontfamily) {
    this._fontFamily = fontfamily
    document.body.style.fontFamily = fontfamily
  }

  get fontFamily () {
    return this._fontFamily
  }

  get buttons () {
    return this._buttons
  }

  get gallery () {
    return this._gallery
  }

  get menu () {
    return this._menu
  }

  /**
   * Saves the current state if different than the previous state
   * @param  {string} csrfToken required token for api
   */
  actionSave (csrfToken) {
    const state = this.getState()
    if (!areObjectsEqual(state, this._backup)) {
      this.saveData(state, csrfToken)
    }
  }

  /**
   * Saves the previous state if different than the current state
   * @param  {string} csrfToken required token for api
   */
  actionCancel (csrfToken) {
    if (!areObjectsEqual(this.getState(), this._backup)) {
      this.saveData(this._backup, csrfToken)
    }
  }

  /**
   * Marks an image for deletion
   * @param  {event} e click event
   */
  editDeleteImage (e) {
    if (e) {
      const id = e.target.getAttribute('data-id') || e.target.parentNode.getAttribute('data-id')
      if (id) {
        this._gallery.removeImageById(id)
      }
    }
  }

  /**
   * Recovers an image
   * @param  {event} e click event
   */
  editRevertImage (e) {
    if (e) {
      const id = e.target.getAttribute('data-id') || e.target.parentNode.getAttribute('data-id')
      if (id) {
        this._gallery.revertRemoveImageById(id)
      }
    }
  }

  /**
   * Saves data, dispatching a loading event, setting the new state
   * @param  {object} data      [description]
   * @param  {string} csrfToken required csrfToken
   */
  saveData (data, csrfToken) {
    document.dispatchEvent(new Event(EVENT_LOADING))
    this.uploadData(data, csrfToken)
      .then((res) => {
        this.actionUpdate(res.data)
        this.onUpdate(res.data, this._backup)
        this._backup = this.getState()
      })
      .catch(err => console.log(err))
      .finally(() => document.dispatchEvent(new Event(EVENT_LOADED)))
  }

  /**
   * Updates the view
   * @param  {object} data
   */
  actionUpdate (data) {
    const {
      images,
      title,
      note,
      bgcolor,
      textcolor,
      fontfamily
    } = data

    if (images) {
      this._gallery.setImages(images)
      this._gallery.images.map(image => this.addControlsToImage(image))
    }
    if (title) {
      document.querySelector(SELECTOR_TITLE).innerHTML = title
    }
    if (note) {
      const html = htmlToElement('<div>' + note + '</div>')
      document.querySelector(SELECTOR_NOTE).innerHTML = ''
      document.querySelector(SELECTOR_NOTE).appendChild(html)
    }
    if (bgcolor && isHexColor(bgcolor)) {
      this.bgColor = bgcolor
      document.body.style.backgroundColor = this.bgColor
    }
    if (textcolor && isHexColor(textcolor)) {
      this.textColor = textcolor
      document.body.style.color = this.textColor
    }
    if (fontfamily) {
      this.fontFamily = fontfamily
      document.body.style.fontFamily = this.fontFamily
    }
  }

  /**
   * Returns the current state
   * @return {object}
   */
  getState () {
    const result = {
      title: '',
      note: '',
      images: []
    }
    const title = document.querySelector(SELECTOR_TITLE)
    const note = document.querySelector(SELECTOR_NOTE)
    const bgColor = this.bgColor
    const textColor = this.textColor
    const fontFamily = this.fontFamily
    const images = this._gallery.images

    if (title) {
      result.title = removeHtml(title.innerHTML)
    }
    if (note) {
      result.note = processContentEditable(note.innerHTML)
    }
    if (bgColor && isHexColor(bgColor)) {
      result.bgcolor = bgColor
    }
    if (textColor && isHexColor(textColor)) {
      result.textcolor = textColor
    }
    if (fontFamily) {
      result.fontfamily = fontFamily
    }
    if (images && images.length) {
      result.images = [...images].map((image) => {
        return {
          id: image.getId(),
          filename: image.filename,
          newfilename: removeHtml(image.caption)
        }
      })
    }
    return result
  }

  /**
   * Calls the api with the new data to be saved
   * @param  {object} data      [description]
   * @param  {string} csrfToken [description]
   * @return {Promise}           [description]
   */
  uploadData (data, csrfToken) {
    const api = new Fetch()
    const formData = new FormData()
    const url = API_URL

    formData.append('data', JSON.stringify(data))
    formData.append('action', API_SAVE)
    formData.append('csrf_token', csrfToken)

    return new Promise((resolve, reject) => {
      api.newRequest(url, formData)
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
  }

  /**
   * Calls the api with a file data to be uploaded
   * @param  {File} file        [description]
   * @param  {string} csrfToken [description]
   * @return {Promise}          [description]
   */
  uploadFile (file, csrfToken) {
    const api = new Fetch()
    const url = API_URL
    const formData = new FormData()

    formData.append('file', file)
    formData.append('action', API_UPLOAD)
    formData.append('csrf_token', csrfToken)

    return new Promise((resolve, reject) => {
      api.newRequest(url, formData)
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
  }

  /**
   * Adds a new image to Editor's gallery, and adds controls
   * @param  {File} file     [description]
   * @param  {string} filename [description]
   */
  previewFile (file, filename) {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onloadend = () => {
      const image = this._gallery.addImage(this.getPreviewDom(reader.result, filename))

      if (image) {
        this.addControlsToImage(image)
      }
    }
  }

  /**
   * Returns an image domNode
   * @param  {string} src      [description]
   * @param  {string} filename [description]
   * @return {domNode}          [description]
   */
  getPreviewDom (src, filename) {
    if (src) {
      return htmlToElement(`<div class="Image">
        <div class="Image__container">
          <img class="lazy miniarch" src="./assets/css/loading.gif" data-src="${src}" data-filename="${filename}" title="${filename} preview" />
        </div>
        <div class="Image__caption"><span contenteditable="true">${stripExtension(filename)}</span></div>
        </div>`)
    }
  }

  /**
   * Handles drop zone event, calling the file handler
   * @param  {event} e drop event
   */
  handleDrop (e) {
    const files = e.dataTransfer.files
    const imageFiles = []

    let i = -1
    while (++i < files.length) {
      if (files[i].type.match(/image.*/)) {
        imageFiles.push(files[i])
      }
    }
    if (imageFiles.length > 0) {
      this.handleFiles(imageFiles)
    }
  }

  /**
   * Uploads a series of files
   * @param  {array} files [description]
   */
  handleFiles (files) {
    files = [...files]
    this._progressbar.initializeProgress(files.length)
    files.forEach(file => {
      this.uploadFile(file, this.getCsrfToken(this._dropArea))
        .then((result) => {
          if (result && result.data && result.data.length && result.data[0]) {
            this.previewFile(file, result.data[0].name)
            this.files.push(result.data[0])
          }
        })
        .catch(err => {
          console.log(err)
        })
    })
  }

  /**
   * Returns a preformatted button domNode
   * @param  {domNode|string} content     [description]
   * @param  {string} buttonClass [description]
   * @param  {string|number} id          [description]
   * @return {domNode}             [description]
   */
  getImageButton (content, buttonClass, id) {
    const dom = htmlToElement(`<div class="pure-button ${buttonClass}" data-id="${id}"><span>${content}</span></div>`)
    return dom
  }

  /**
   * Gets a csrf_token in dom
   * @param  {domNode} domNode target to where to look for the token
   * @return {string}         [description]
   */
  getCsrfToken (domNode) {
    if (domNode && isDomNode(domNode)) {
      const inputElement = domNode.querySelector('[name=csrf_token]')
      return inputElement && inputElement.value
    }
    return ''
  }

  /**
   * Adds the highlight class to drop area
   */
  highlight () {
    this._dropArea.classList.add('highlight')
  }

  /**
   * Removes the highlight class to drop area
   */
  unhighlight () {
    this._dropArea.classList.remove('highlight')
  }
}

export default Editor
