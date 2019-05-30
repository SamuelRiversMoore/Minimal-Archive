/* global Event */

import LazyLoad from './LazyLoad.js'
import Image from './Image.js'
import {
  EVENT_IMAGE_UPDATE,
  EVENT_RESET
} from './Constants.js'
import {
  basename,
  htmlToElement,
  isDomNode,
  scrollTo,
  stripExtension
} from './Helpers.js'

const mergeSettings = (options) => {
  const settings = {
    gallerySelector: '.Gallery',
    imageSelector: '.Image',
    lazyloadSelector: '.lazy',
    active: true
  }

  for (const attrName in options) {
    settings[attrName] = options[attrName]
  }

  return settings
}

class Gallery {
  constructor (options) {
    this.config = mergeSettings(options)
    this.init()
  }

  init () {
    const {
      gallerySelector,
      imageSelector,
      lazyloadSelector,
      active
    } = this.config
    const images = document.querySelectorAll(imageSelector)

    this.keyHandler = this.keyHandler.bind(this)
    this.updateImage = this.updateImage.bind(this)
    this.gallery = document.querySelector(gallerySelector)
    this._current = null

    if (!this.gallery) {
      console.warn(`\nModule: Gallery.js\nWarning: No Gallery dom node found in document.\nCause: No gallerySelector provided.\nResult: Adding images may fail.`)
    }

    let i = -1
    this._images = []
    while (++i < images.length) {
      const image = this.getNewImage(images[i], this.active)
      if (image) {
        this._images.push(image)
      }
    }

    this.lazyload = new LazyLoad({
      elements_selector: lazyloadSelector
    })

    if (active) {
      this.activate()
    }
  }

  getNewImage (dom, active) {
    if (!dom || !isDomNode(dom)) {
      return null
    }
    const url = dom.querySelector('img') && dom.querySelector('img').src
    const datafilename = dom.querySelector('img') && dom.querySelector('img').getAttribute('data-filename')
    const filename = datafilename ? basename(datafilename) : dom.querySelector('img') ? basename(dom.querySelector('img').src) : null
    const caption = dom.querySelector('.Image__caption span') && dom.querySelector('.Image__caption span').innerHTML

    return new Image(
      {
        url: url,
        filename: filename,
        caption: caption,
        dom: dom,
        active: active,
        editable: !active
      })
  }

  activate () {
    this.active = true
    this.gallery.classList.remove('Gallery--inactive')
    this.gallery.classList.add('Gallery--active')
    this.initListeners()
  }

  deactivate () {
    this.active = false
    this.gallery.classList.remove('Gallery--active')
    this.gallery.classList.add('Gallery--inactive')
    this.removeListeners()
  }

  toggleActive () {
    this.active = !this.active
  }

  initListeners () {
    document.addEventListener(EVENT_IMAGE_UPDATE, this.updateImage)
    document.addEventListener('keyup', this.keyHandler)
  }

  removeListeners () {
    document.removeEventListener(EVENT_IMAGE_UPDATE, this.updateImage)
    document.removeEventListener('keyup', this.keyHandler)
  }

  updateImage (e) {
    if (e.detail && e.detail.image && e.detail.image instanceof Image) {
      this.updateCurrentImage(e.detail.image)
    } else {
      this.updateCurrentImage(null)
    }
  }

  updateCurrentImage (image) {
    if (this._current instanceof Image) {
      this._current.status = false
    }
    this._current = image
    if (this._current instanceof Image) {
      this._current.status = true
      scrollTo(this._current.dom)
    } else {
      scrollTo(0)
    }
  }

  keyHandler (e) {
    switch (e.key) {
      case 'ArrowLeft':
        if (this._current) {
          e.preventDefault()
          this.prev()
        }
        break
      case 'ArrowRight':
        if (this._current) {
          e.preventDefault()
          this.next()
        }
        break
      case 'Escape':
        this.reset()
        break
    }
  }

  addImage (dom) {
    if (dom && document.body.contains(dom)) {
      this._images.push(this.getNewImage(dom, this.active))
    } else if (dom && !document.body.contains(dom)) {
      const images = document.querySelectorAll(this.config.imageSelector)
      if (images.length) {
        images[images.length - 1].parentNode.insertBefore(dom, images[images.length - 1].nextSibling)
      } else {
        this.gallery.appendChild(dom)
      }
      this._images.push(this.getNewImage(dom, this.active))
    }
    this.lazyload.update()
  }

  setImages (images) {
    if (!images || !images.length) {
      return
    }
    this.gallery.innerHTML = null
    this.images = []
    let i = -1
    while (++i < images.length) {
      this.addImage(this.getImageDom(images[i].src, images[i].filename))
    }
  }

  getImageDom (src, filename) {
    if (src) {
      return htmlToElement(`<div class="Image">
        <div class="Image__container">
          <img class="lazy miniarch" src="/assets/css/loading.gif" data-src="${src}" data-filename="${filename}" title="${filename} preview" />
        </div>
        <div class="Image__caption"><span contenteditable="true">${stripExtension(filename)}</span></div>
        </div>`)
    }
  }

  next () {
    const index = this.images.indexOf(this._current)
    if (index >= 0 && index <= this.images.length - 2) {
      this.updateCurrentImage(this.images[index + 1])
    } else if (index > this.images.length - 2) {
      this.updateCurrentImage(this.images[0])
    }
  }

  prev () {
    const index = this.images.indexOf(this._current)
    if (index > 0) {
      this.updateCurrentImage(this.images[index - 1])
    } else if (index === 0) {
      this.updateCurrentImage(this.images[this.images.length - 1])
    }
  }

  reset () {
    document.dispatchEvent(new Event(EVENT_RESET))
  }

  set current (image) {
    this.updateCurrentImage(image)
  }
  get current () {
    return this._current
  }

  get images () {
    return this._images
  }

  set images (images) {
    this._images = images
  }
}

export default Gallery
