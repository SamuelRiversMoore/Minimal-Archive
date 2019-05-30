/* global Event, FormData, FileReader */

import Menu from './Menu.js'
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
      lazyloadSelector: '.lazy'
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

    this.gallery = gallery
    this.dropArea = document.querySelector(dropAreaSelector)
    this.fileInput = document.querySelector(fileInputSelector)
    this.fullscreenDropZone = Boolean(fullscreenDropZone)
    this.buttonCancel = document.querySelector(buttonCancelSelector)
    this.buttonPreview = document.querySelector(buttonPreviewSelector)
    this.buttonSave = document.querySelector(buttonSaveSelector)

    if (!this.gallery) {
      console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No Gallery provided.\nResult: Editor can't initialize.`)
      return
    } else {
      this.gallery.deactivate()
      this.gallery.reset()
    }
    if (!this.dropArea) {
      console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No drop area with selector [${dropAreaSelector}] found in document.\nResult: Editor can't initialize.`)
      return
    }
    if (!this.fileInput) {
      console.warn(`\nModule: Editor.js\nWarning: Can't create file input listener.\nCause: No file input with selector [${fileInputSelector}] found in document.\nResult: Upload by file input button is disabled.`)
    }
    if (!this.buttonPreview) {
      console.warn(`Module: Editor.js\nWarning: Can't add preview functionality.\nCause: No preview button with selector [${buttonPreviewSelector}] found in document.\nResult: Previewing is disabled.`)
    }
    if (!this.buttonSave) {
      console.warn(`Module: Editor.js\nWarning: Can't add save functionality.\nCause: No save button with selector [${buttonSaveSelector}] found in document.\nResult: Saving is disabled.`)
    }
    if (!this.buttonCancel) {
      console.warn(`Module: Editor.js\nWarning: Can't add cancel functionality.\nCause: No cancel button with selector [${buttonCancelSelector}] found in document.\nResult: Undoing changes is disabled.`)
    }
    this.progressbar = new ProgressBar(progressBarSelector)

    this.menu = new Menu()
    this.menu.addButton(this.buttonSave, this.editSave.bind(this))
    this.menu.addButton(this.buttonPreview, this.editPreview.bind(this))
    this.menu.addButton(this.buttonCancel, this.editCancel.bind(this))

    this.initListeners()
    this.backup = this.getState()
  }

  initListeners () {
    // Prevent default drag behaviors
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, preventDefaults, false)
      document.body.addEventListener(eventName, preventDefaults, false)
    })

    if (this.fullscreenDropZone) {
      ;['dragenter'].forEach(eventName => {
        document.addEventListener(eventName, (e) => {
          this.dropArea.classList.add('active')
        }, true)
      })
      ;['dragleave', 'drop'].forEach(eventName => {
        this.dropArea.addEventListener(eventName, (e) => {
          this.dropArea.classList.remove('active')
        }, true)
      })
    }
    // Highlight drop area when item is dragged over it
    ;['dragenter', 'dragover'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, () => {
        this.highlight()
      }, false)
    })

    ;['dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, () => {
        this.unhighlight()
      }, false)
    })

    // Handle dropped files
    this.dropArea.addEventListener('drop', (e) => {
      this.handleDrop(e)
    }, false)

    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        if (e.target && e.target.files) {
          this.handleFiles(e.target.files)
        }
      })
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

  save (data) {
    document.dispatchEvent(new Event(EVENT_LOADING))
    this.uploadData(data, this.getCsrfToken(this.buttonSave))
      .then((res) => {
        if (res.data.images) {
          this.gallery.setImages(res.data.images)
        }
        this.backup = this.getState()
      })
      .catch(err => console.log(err))
      .finally(() => document.dispatchEvent(new Event(EVENT_LOADED)))
  }

  getState () {
    const result = {
      title: '',
      note: '',
      images: []
    }
    const title = document.querySelector(SELECTOR_TITLE)
    const note = document.querySelector(SELECTOR_NOTE)
    const images = this.gallery.images

    if (title) {
      result.title = removeHtml(title.innerHTML)
    }
    if (note) {
      result.note = removeHtml(note.innerHTML)
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
      this.gallery.addImage(this.getPreviewDom(reader.result, filename))
    }
  }

  getCsrfToken (domNode) {
    if (domNode && isDomNode(domNode)) {
      const inputElement = domNode.querySelector('[name=csrf_token]')
      return inputElement && inputElement.value
    }
  }

  getPreviewDom (src, filename) {
    if (src) {
      return htmlToElement(`<div class="Image">
        <div class="Image__container">
          <img class="lazy miniarch" src="/assets/css/loading.gif" data-src="${src}" data-filename="${filename}" title="${filename} preview" />
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
      this.uploadFile(file, this.getCsrfToken(this.dropArea))
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

  highlight (e) {
    this.dropArea.classList.add('highlight')
  }

  unhighlight (e) {
    this.dropArea.classList.remove('highlight')
  }
}

export default Editor
