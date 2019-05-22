import LazyLoad from './LazyLoad.js'
import Image from './Image.js'
import {
  EVENT_RESET,
  EVENT_IMAGE_UPDATE
} from './Constants.js'
import {
  scrollTo,
  htmlToElement
} from './Helpers.js'

const mergeSettings = (options) => {
  const settings = {
    gallerySelector: '.Gallery',
    imageSelector: '.Image',
    lazyloadSelector: '.lazy'
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
      lazyloadSelector
    } = this.config
    const images = document.querySelectorAll(imageSelector)

    this.gallery = document.querySelector(gallerySelector)
    this.currentImage = null

    if (!this.gallery) {
      console.warn(`\nModule: Gallery.js\nWarning: No Gallery dom node found in document.\nCause: No gallerySelector provided.\nResult: Adding images may fail.`)
    }

    let i = -1
    this.imgs = []
    while (++i < images.length) {
      this.imgs.push(new Image(images[i]))
    }

    this.lazyload = new LazyLoad({
      elements_selector: lazyloadSelector
    })

    this.initListeners()
  }

  initListeners () {
    document.addEventListener(EVENT_IMAGE_UPDATE, (e) => {
      if (e.detail && e.detail.image && e.detail.image instanceof Image) {
        this.updateCurrentImage(e.detail.image)
      } else {
        this.updateCurrentImage(null)
      }
    })

    document.addEventListener('keyup', this.keyHandler.bind(this))
  }

  updateCurrentImage (image) {
    if (this.currentImage instanceof Image) {
      this.currentImage.status = false
    }
    this.currentImage = image
    if (this.currentImage instanceof Image) {
      this.currentImage.status = true
      scrollTo(this.currentImage.dom)
    } else {
      scrollTo(0)
    }
  }

  keyHandler (e) {
    switch (e.key) {
      case 'ArrowLeft':
        if (this.currentImage) {
          e.preventDefault()
          this.prev()
        }
        break
      case 'ArrowRight':
        if (this.currentImage) {
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
      this.imgs.push(new Image(dom))
    } else if (dom && !document.body.contains(dom)) {
      const images = document.querySelectorAll(this.config.imageSelector)
      if (images.length) {
        images[images.length - 1].parentNode.insertBefore(dom, images[images.length - 1].nextSibling)
      } else {
        this.gallery.appendChild(dom)
      }
      this.imgs.push(new Image(dom))
    }
    this.lazyload.update()
  }

  get current () {
    return this.currentImage
  }

  set current (image) {
    this.updateCurrentImage(image)
  }

  get images () {
    return this.imgs
  }

  set images (images) {
    this.imgs = images
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
        <div class="Image__caption"><span contenteditable="true">${filename}</span></div>
        </div>`)
    }
  }

  next () {
    const index = this.images.indexOf(this.currentImage)
    if (index >= 0 && index <= this.images.length - 2) {
      this.updateCurrentImage(this.images[index + 1])
    } else if (index > this.images.length - 2) {
      this.updateCurrentImage(this.images[0])
    }
  }

  prev () {
    const index = this.images.indexOf(this.currentImage)
    if (index > 0) {
      this.updateCurrentImage(this.images[index - 1])
    } else if (index === 0) {
      this.updateCurrentImage(this.images[this.images.length - 1])
    }
  }

  reset () {
    document.dispatchEvent(new Event(EVENT_RESET))
  }
}

export default Gallery
