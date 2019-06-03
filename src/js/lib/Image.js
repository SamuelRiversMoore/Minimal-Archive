/* global CustomEvent, Event */

import {
  EVENT_RESET,
  EVENT_STATUS_CHANGE,
  EVENT_IMAGE_UPDATE
} from './Constants.js'

import {
  isDomNode,
  uuidv4,
  htmlToElement,
  removeHtml
} from './Helpers.js'

const mergeSettings = (options) => {
  const settings = {
    dom: null,
    filename: null,
    active: true,
    url: null,
    caption: null,
    imageSelector: '.Image',
    lazyloadSelector: '.lazy',
    editable: false
  }

  for (const attrName in options) {
    settings[attrName] = options[attrName]
  }

  return settings
}

class Image {
  constructor (options) {
    this.config = mergeSettings(options)
    this.dispatchStatusUpdate = this.dispatchStatusUpdate.bind(this)

    const {
      url,
      filename,
      caption,
      dom,
      active,
      editable
    } = this.config

    this._id = uuidv4()
    this._dom = isDomNode(dom) ? dom : this.generateDom(url, filename, caption)
    if (!this._dom) {
      console.warn('%o is not a dom element. Can\'t get image dom.', dom)
    }
    this._src = url
    this._caption = removeHtml(caption)
    this._filename = filename
    this._captionSelector = this._dom && this._dom.querySelector('[contenteditable]')
    this._active = active
    this._status = false
    this._editable = editable

    this.applyStyle()
    this.initListeners()
  }

  initListeners () {
    if (this._active && this._dom) {
      this._dom.addEventListener('click', this.toggleStatus.bind(this))
      this._dom.addEventListener(EVENT_STATUS_CHANGE, this.applyStyle.bind(this))
    }
    document.addEventListener(EVENT_RESET, (e) => {
      this._status = false
      this.dispatchStatusUpdate()
    })

    if (this._editable && this._captionSelector) {
      this._captionSelector.addEventListener('input', (e) => {
        this._caption = removeHtml(this._captionSelector.innerHTML)
      })
    }
  }

  toggleStatus (event) {
    this._status = !this._status
    this.dispatchStatusUpdate()
  }

  dispatchStatusUpdate (event) {
    if (this._dom) {
      this._dom.dispatchEvent(new Event(EVENT_STATUS_CHANGE))
    }
    document.dispatchEvent(new CustomEvent(EVENT_IMAGE_UPDATE, {
      detail: {
        image: this._status ? this : null
      }
    }))
  }

  applyStyle () {
    if (this._dom) {
      if (this._status) {
        this._dom.classList.add('Image--active')
        this._dom.classList.remove('Image--inactive')
      } else {
        this._dom.classList.remove('Image--active')
        this._dom.classList.add('Image--inactive')
      }
    }
  }

  generateDom (src, filename, caption) {
    if (src) {
      return htmlToElement(`<div class="Image">
        <div class="Image__container">
          <img class="lazy miniarch" src="/assets/css/loading.gif" data-src="${removeHtml(src)}" data-filename="${removeHtml(filename)}" title="${filename} preview" />
        </div>
        <div class="Image__caption"><span contenteditable="true">${removeHtml(caption)}</span></div>
        </div>`)
    }
  }

  getId () {
    return this._id
  }

  set dom (dom) {
    this._dom = dom
  }
  get dom () {
    return this._dom ? this._dom : this.generateDom(this._src, this._filename, this._caption)
  }

  set status (status) {
    this._status = status
    this._dom && this._dom.dispatchEvent(new Event(EVENT_STATUS_CHANGE))
  }
  get status () {
    return this._status
  }

  set caption (caption) {
    this._caption = caption
  }
  get caption () {
    return this._caption
  }

  set filename (filename) {
    this._filename = removeHtml(filename)
  }
  get filename () {
    return this._filename
  }

  set src (src) {
    this._src = removeHtml(src)
  }
  get src () {
    return this._src
  }
}

export default Image
