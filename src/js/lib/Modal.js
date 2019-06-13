/* global CustomEvent */

import {
  EVENT_MODAL_UPDATE
} from './Constants.js'

import {
  htmlToElement,
  isDomNode,
  uuidv4
} from './Helpers.js'

const mergeSettings = (options) => {
  const settings = {
    target: false,
    content: null,
    customClass: null,
    active: false,
    triggers: null
  }

  for (const attrName in options) {
    settings[attrName] = options[attrName]
  }

  return settings
}

class Modal {
  constructor (options) {
    this.config = mergeSettings(options)
    this.keyHandler = this.keyHandler.bind(this)
    this.init()
  }

  init () {
    const {
      target,
      content,
      active,
      triggers
    } = this.config

    this._active = false
    this._id = uuidv4()
    this._triggers = triggers && isDomNode(triggers) ? [triggers] : triggers && typeof triggers === 'string' ? document.querySelectorAll(triggers) : false
    this._content = content && isDomNode(content) ? content : content && content !== false ? htmlToElement(content) : null
    this._target = target && isDomNode(target) ? target : target && typeof target === 'string' ? document.querySelector(target) : false

    this._dom = this.setupDom(this._target, this._content, this._id)
    this._bodyoverflow = document.body.style.overflow
    this.setupListeners()

    if (active) {
      this.activate()
    } else {
      this.deactivate()
    }
  }

  activate () {
    this.dispatchStatusUpdate(true)
  }

  deactivate () {
    this.dispatchStatusUpdate(false)
  }

  toggle () {
    this.dispatchStatusUpdate(!this._active)
  }

  setupListeners () {
    if (this._triggers) {
      let i = -1
      while (++i < this._triggers.length) {
        this._triggers[i].addEventListener('click', this.toggle.bind(this))
      }
    }

    document.addEventListener('keyup', this.keyHandler)
    document.addEventListener(EVENT_MODAL_UPDATE, (e) => {
      if (e && e.detail && e.detail.id === this._id) {
        this._active = e.detail.status
        this.updateView()
      }
    })
  }

  updateView () {
    if (this._active) {
      this._bodyoverflow = document.body.style.overflow
      this._dom.style.opacity = 1
      this._dom.style.visibility = 'visible'
      document.body.style.position = 'fixed'
      document.body.style.overflow = 'hidden'
    } else {
      this._dom.style.opacity = 0
      this._dom.style.visibility = 'hidden'
      document.body.style.position = 'relative'
      document.body.style.overflow = this._bodyoverflow
    }
  }

  dispatchStatusUpdate (status) {
    document.dispatchEvent(new CustomEvent(EVENT_MODAL_UPDATE, {
      detail: {
        id: this._id,
        status: status
      }
    }))
  }

  keyHandler (e) {
    switch (e.key) {
      case 'Escape':
        if (this._active) {
          this.deactivate()
        }
        break
    }
  }

  setupDom (target, content, id) {
    if (target) {
      if (content) {
        target.innerHTML = content
      }
      return target
    } else {
      const okContent = content || ''
      const container = htmlToElement(`
        <aside>
          <div class="modal">
            <label class="modal__bg" for="${id}"></label>
            <div class="modal__inner">
                <label class="modal__close" for="${id}"></label>
                ${okContent}
            </div>
          </div>
        </aside>
      `)
      document.body.appendChild(container)
      return container
    }
  }

  get active () {
    return this._active
  }
}

export default Modal
