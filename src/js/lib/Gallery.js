import LazyLoad from './LazyLoad.js'
import Image from './Image.js'
import {
  scrollTo
} from './Helpers.js'

const mergeSettings = (options) => {
  const settings = {
    el: document.querySelector('.Gallery'),
    nextBtn: document.querySelector('.GalleryNavigation--next'),
    prevBtn: document.querySelector('.GalleryNavigation--prev'),
    startSlide: 0,
    speed: 400,
    auto: false,
    draggable: false,
    continuous: true,
    disableScroll: false,
    stopPropagation: false,
    callback: (index, elem, dir) => {},
    transitionEnd: (index, elem) => {}
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
    const images = document.querySelectorAll('.Image')

    this.currentImage = null

    let i = -1
    this.imgs = []
    while (++i < images.length) {
      this.imgs.push(new Image(images[i]))
    }

    this.lazyload = new LazyLoad({
      elements_selector: '.lazy'
    })

    this.initListeners()
  }

  initListeners () {
    document.addEventListener('image-update', (e) => {
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
    document.dispatchEvent(new Event('reset'))
  }
}

export default Gallery
