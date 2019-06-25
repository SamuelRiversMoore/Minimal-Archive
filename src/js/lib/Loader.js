import {
  EVENT_LOADING,
  EVENT_LOADED
} from './Constants.js'
import {
  mergeSettings
} from './Helpers.js'

class Loader {
  constructor (options) {
    this.config = mergeSettings(options, { loaderClass: 'Loader' })
    this.init()
  }

  init () {
    const {
      loaderClass
    } = this.config
    const content = document.createElement('div')

    content.classList.add('content')
    content.innerHTML = 'Loading...'

    this.dom = document.createElement('aside')
    this.dom.classList.add(loaderClass)
    this.dom.appendChild(content)

    document.body.appendChild(this.dom)
    this.initListeners()
  }

  initListeners () {
    document.addEventListener(EVENT_LOADING, () => {
      this.start()
    })
    document.addEventListener(EVENT_LOADED, () => {
      setTimeout(() => {
        this.stop()
      }, 1000)
    })
  }

  start () {
    this.dom.classList.remove('transition-end')
    this.dom.classList.remove(EVENT_LOADED)
    this.dom.classList.add('transition-start')
    setTimeout(() => {
      this.dom.classList.add(EVENT_LOADING)
    }, 0.25)
  }

  stop () {
    this.dom.classList.remove('transition-start')
    this.dom.classList.remove(EVENT_LOADING)
    this.dom.classList.add(EVENT_LOADED)
    setTimeout(() => {
      this.dom.classList.add('transition-end')
    }, 0.25)
  }
}

export default Loader
