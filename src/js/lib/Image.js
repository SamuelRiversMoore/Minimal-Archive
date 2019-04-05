import {
  isDomNode
} from './Helpers.js'

class Image {
  constructor (image) {
    if (!isDomNode(image)) {
      console.error('%o is not a dom element!', image)
    }
    this.dom = image
    this.stat = false
    this.initListeners()
    this.dispatchStatusUpdate = this.dispatchStatusUpdate.bind(this)
  }

  initListeners () {
    this.dom.addEventListener('click', this.toggleStatus.bind(this))
    this.dom.addEventListener('status-change', this.applyStyle.bind(this))
    document.addEventListener('reset', (e) => {
      this.stat = false
      this.dispatchStatusUpdate()
    })
  }

  toggleStatus (event) {
    this.stat = !this.stat
    this.dispatchStatusUpdate()
  }

  dispatchStatusUpdate (event) {
    this.dom.dispatchEvent(new Event('status-change'))
    document.dispatchEvent(new CustomEvent('image-update', {
      detail: {
        image: this.stat ? this : null
      }
    }))
  }

  applyStyle (event) {
    if (this.stat) {
      this.dom.classList.add('Image--active')
    } else {
      this.dom.classList.remove('Image--active')
    }
  }

  set image (image) {
    this.dom = image
  }

  get image () {
    return this.dom
  }

  set status (status) {
    this.stat = status
    this.dom.dispatchEvent(new Event('status-change'))
  }

  get status () {
    return this.stat
  }
}

export default Image
