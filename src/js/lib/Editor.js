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
  baseUrl,
  htmlToElement,
  isDomNode,
  isHexColor,
  preventDefaults,
  stripExtension,
  removeHtml,
  Fetch
} from './Helpers.js'

const mergeSettings = (options) => {
  const settings = {
    dropAreaSelector: '#drop-area',
    fileInputSelector: '#file-input',
    progressBarSelector: '.progress-bar',
    buttonPreviewSelector: '.editbutton.preview',
    buttonCancelSelector: '.editbutton.cancel',
    buttonSaveSelector: '.editbutton.save',
    gallery: new Gallery({
      gallerySelector: '.Gallery',
      imageSelector: '.Image',
      lazyloadSelector: '.lazy',
      active: false
    }),
    fullscreenDropZone: true
  }

  for (const attrName in options) {
    settings[attrName] = options[attrName]
  }

  return settings
}

class Editor {
  constructor (options) {
    this.config = mergeSettings(options)
    this.uploadFile = this.uploadFile.bind(this)
    this.previewFile = this.previewFile.bind(this)
    this.refreshView = this.refreshView.bind(this)
    this.files = []
    this.init()
  }

  init () {
    const {
      gallery,
      dropAreaSelector,
      fullscreenDropZone,
      fileInputSelector,
      progressBarSelector,
      buttonPreviewSelector,
      buttonCancelSelector,
      buttonSaveSelector
    } = this.config

    this._gallery = gallery
    this._dropArea = document.querySelector(dropAreaSelector)
    this._fileInput = document.querySelector(fileInputSelector)
    this._fullscreenDropZone = Boolean(fullscreenDropZone)
    this._buttonCancel = document.querySelector(buttonCancelSelector)
    this._buttonPreview = document.querySelector(buttonPreviewSelector)
    this._buttonSave = document.querySelector(buttonSaveSelector)
    this._bgColorInput = document.querySelector('.editbutton input[name="bg_color"]')
    this._textColorInput = document.querySelector('.editbutton input[name="text_color"]')

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
    if (!this._buttonPreview) {
      console.warn(`Module: Editor.js\nWarning: Can't add preview functionality.\nCause: No preview button with selector [${buttonPreviewSelector}] found in document.\nResult: Previewing is disabled.`)
    }
    if (!this._buttonSave) {
      console.warn(`Module: Editor.js\nWarning: Can't add save functionality.\nCause: No save button with selector [${buttonSaveSelector}] found in document.\nResult: Saving is disabled.`)
    }
    if (!this._buttonCancel) {
      console.warn(`Module: Editor.js\nWarning: Can't add cancel functionality.\nCause: No cancel button with selector [${buttonCancelSelector}] found in document.\nResult: Undoing changes is disabled.`)
    }
    this.progressbar = new ProgressBar(progressBarSelector)

    this.menu = new Menu()
    this.setupMenuButtons()

    ;(() => new Modal({
      target: '.modal',
      active: true,
      triggers: '.modal__bg, .modal__close'
    }))()

    this.backup = this.getState()
    this.initListeners()
  }

  setupMenuButtons () {
    // Save
    this.menu.addButton({
      domNode: this._buttonSave,
      callback: this.editSave.bind(this)
    })

    // Cancel
    this.menu.addButton({
      domNode: this._buttonCancel,
      callback: this.editCancel.bind(this)
    })

    // Preview
    this.menu.addButton({
      domNode: this._buttonPreview,
      callback: this.editPreview.bind(this)
    })

    // Background color
    this.menu.addButton({
      domNode: this._bgColorInput,
      type: 'input',
      callback: this.editBgColor.bind(this)
    })

    // Text color
    this.menu.addButton({
      domNode: this._textColorInput,
      type: 'input',
      callback: this.editTextColor.bind(this)
    })
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

  addControlsToImage (image) {
    const deleteButton = this.getButton('Delete', 'button--delete', image.getId())
    const revertButton = this.getButton('Revert', 'button--revert', image.getId())
    const imageControls = htmlToElement('<div class="Image__controls"></div>')

    imageControls.appendChild(deleteButton)
    imageControls.appendChild(revertButton)
    image.dom.appendChild(imageControls)
    this.menu.addButton({
      type: 'toggle',
      domNode: deleteButton,
      domNode2: revertButton,
      callback: this.editDelete.bind(this),
      callback2: this.editRevert.bind(this)
    })
  }

  editBgColor () {
    if (isHexColor(this._bgColorInput.value)) {
      document.body.style.backgroundColor = this._bgColorInput.value
      this._bgColorInput.nextSibling.innerHTML = this._bgColorInput.value
    }
  }

  editTextColor () {
    if (isHexColor(this._textColorInput.value)) {
      document.body.style.color = this._textColorInput.value
      this._textColorInput.nextSibling.innerHTML = this._textColorInput.value
    }
  }

  editCancel () {
    if (!areObjectsEqual(this.getState(), this.backup)) {
      this.save(this.backup)
    }
  }

  editPreview () {
    window.location = baseUrl()
  }

  editSave () {
    const state = this.getState()
    if (!areObjectsEqual(state, this.backup)) {
      this.save(state)
    }
  }

  editDelete (e) {
    if (e) {
      const id = e.target.getAttribute('data-id') || e.target.parentNode.getAttribute('data-id')
      if (id) {
        this._gallery.removeImageById(id)
      }
    }
  }

  editRevert (e) {
    if (e) {
      const id = e.target.getAttribute('data-id') || e.target.parentNode.getAttribute('data-id')
      if (id) {
        this._gallery.revertRemoveImageById(id)
      }
    }
  }

  save (data) {
    document.dispatchEvent(new Event(EVENT_LOADING))
    this.uploadData(data, this.getCsrfToken(this._buttonSave))
      .then((res) => {
        this.refreshView(res.data)
        this.backup = this.getState()
      })
      .catch(err => console.log(err))
      .finally(() => document.dispatchEvent(new Event(EVENT_LOADED)))
  }

  refreshView (data) {
    const {
      images,
      title,
      note,
      textcolor,
      bgcolor
    } = data

    if (images) {
      this._gallery.setImages(images)
      this._gallery.images.map(image => this.addControlsToImage(image))
    }
    if (title) {
      document.querySelector(SELECTOR_TITLE).innerHTML = title
    }
    if (note) {
      document.querySelector(SELECTOR_NOTE).innerHTML = note
    }
    if (textcolor) {
      if (isHexColor(textcolor)) {
        this._textColorInput.value = textcolor
        this._textColorInput.nextSibling.innerHTML = this._bgColorInput.value
      }
    }
    if (bgcolor) {
      if (isHexColor(bgcolor)) {
        document.body.style.backgroundColor = bgcolor
        this._bgColorInput.value = bgcolor
        this._bgColorInput.nextSibling.innerHTML = bgcolor
      }
    }
  }

  getState () {
    const result = {
      title: '',
      note: '',
      images: []
    }
    const title = document.querySelector(SELECTOR_TITLE)
    const note = document.querySelector(SELECTOR_NOTE)
    const bgColor = this._bgColorInput
    const textColor = this._textColorInput
    const images = this._gallery.images

    if (title) {
      result.title = removeHtml(title.innerHTML)
    }
    if (note) {
      result.note = removeHtml(note.innerHTML)
    }
    if (bgColor && isHexColor(bgColor.value)) {
      result.bgcolor = bgColor.value
    }
    if (textColor && isHexColor(textColor.value)) {
      result.textcolor = textColor.value
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

  uploadFile (file, csrfToken, i) {
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

  handleFiles (files) {
    files = [...files]
    this.progressbar.initializeProgress(files.length)
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

  getButton (content, buttonClass, id) {
    const dom = htmlToElement(`<div class="pure-button ${buttonClass}" data-id="${id}"><span>${content}</span></div>`)
    return dom
  }

  getCsrfToken (domNode) {
    if (domNode && isDomNode(domNode)) {
      const inputElement = domNode.querySelector('[name=csrf_token]')
      return inputElement && inputElement.value
    }
  }

  highlight (e) {
    this._dropArea.classList.add('highlight')
  }

  unhighlight (e) {
    this._dropArea.classList.remove('highlight')
  }
}

export default Editor
