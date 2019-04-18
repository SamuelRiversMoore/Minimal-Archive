import ProgressBar from './ProgressBar.js'
import {
  htmlToElement
} from './Helpers.js'

const mergeSettings = (options) => {
  const settings = {
    dropAreaSelector: '#drop-area',
    fileInputSelector: '#file-input',
    progressBarSelector: '.progress-bar',
    gallery: null
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

    this.init()
  }

  init () {
    const {
      gallery,
      dropAreaSelector,
      fileInputSelector,
      progressBarSelector
    } = this.config

    console.log(gallery)
    this.gallery = gallery
    this.dropArea = document.querySelector(dropAreaSelector)
    this.fileInput = document.querySelector(fileInputSelector)
    if (!this.gallery) {
      console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No Gallery provided.\nResult: Editor can't initialize.`)
      return
    }
    if (!this.fileInput) {
      console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No file input with selector [${fileInputSelector}] found in document.\nResult: Editor can't initialize.`)
      return
    }
    if (!this.dropArea) {
      console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No drop area with selector [${dropAreaSelector}] found in document.\nResult: Editor can't initialize.`)
      return
    }
    this.progressbar = new ProgressBar(progressBarSelector)
    this.initListeners()
  }

  initListeners () {
    // Prevent default drag behaviors
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, this.preventDefaults, false)
      document.body.addEventListener(eventName, this.preventDefaults, false)
    })

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

    this.fileInput.addEventListener('change', (e) => {
      if (e.target && e.target.files) {
        this.handleFiles(e.target.files)
      }
    })
  }

  uploadFile (file, i) {
    // const url = '/edit?upload_file'
    // var xhr = new XMLHttpRequest()
    // var formData = new FormData()
    // xhr.open('POST', url, true)
    // xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

    // // Update progress (can be used to show progress indicator)
    // xhr.upload.addEventListener('progress', (e) => {
    //   this.progressbar.updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
    // })

    // xhr.addEventListener('readystatechange', (e) => {
    //   if (xhr.readyState === 4 && xhr.status === 200) {
    //     this.progressbar.updateProgress(i, 100)
    //   } else if (xhr.readyState === 4 && xhr.status !== 200) {
    //     console.log(xhr)
    //   }
    // })

    // formData.append('file', file)
    // xhr.send(formData)
  }

  previewFile (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onloadend = () => {
      const dom = this.getPreviewDom(reader.result)
      console.log(dom)
      this.gallery.addImage(dom)
    }
  }

  getPreviewDom (src) {
    return htmlToElement(`<div class="Image">
      <div class="Image__container">
        <img class="lazy miniarch" src="/assets/css/loading.gif" data-src="${src}" title="new image preview" />
      </div>
      <div class="Image__caption"><span contenteditable="true">new_image</span></div>
      </div>`)
  }

  handleFiles (files) {
    files = [...files]
    this.progressbar.initializeProgress(files.length)
    files.forEach(this.uploadFile)
    files.forEach(this.previewFile)
  }

  handleDrop (e) {
    const dt = e.dataTransfer
    const files = dt.files

    this.handleFiles(files)
  }

  preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  highlight (e) {
    this.dropArea.classList.add('highlight')
  }

  unhighlight (e) {
    this.dropArea.classList.remove('active')
  }
}

export default Editor
