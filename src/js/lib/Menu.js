import {
  isDomNode,
  isFunction,
  mergeSettings,
  uuidv4
} from './Helpers.js'

class Menu {
  constructor (options) {
    this.config = mergeSettings(options, {})
    this.init()
  }

  init () {
    this._buttons = []
    this._callback = null
  }

  getButtonOptions (options) {
    const result = {
      domNode: undefined,
      callback: undefined,
      type: 'simple',
      domNode2: undefined,
      callback2: undefined
    }

    for (const attrName in options) {
      result[attrName] = options[attrName]
    }
    return result
  }

  addButton (options) {
    const id = uuidv4()
    const {
      domNode,
      callback,
      type,
      domNode2,
      callback2
    } = this.getButtonOptions(options)

    if (isDomNode(domNode)) {
      this._buttons[id] = {}
      this._buttons[id].dom = domNode

      if (type === 'simple') {
        if (isFunction(callback)) {
          this._buttons[id].callback = callback
          this._buttons[id].dom.classList.add('clickable')
          domNode.addEventListener('click', this._buttons[id].callback)
        }
      }

      if (type === 'toggle') {
        this._buttons[id].state = false
        this._buttons[id].dom.classList.add('clickable')
        domNode.addEventListener('click', () => this.toggleButtonById(id))
        if (isFunction(callback)) {
          this._buttons[id].callback = callback
          domNode.addEventListener('click', this._buttons[id].callback)
        }
        if (isDomNode(domNode2)) {
          this._buttons[id].dom2 = domNode2
          this._buttons[id].dom2.classList.add('clickable')
          domNode2.addEventListener('click', () => this.toggleButtonById(id))
          if (isFunction(callback2)) {
            this._buttons[id].callback2 = callback2
            domNode2.addEventListener('click', this._buttons[id].callback2)
          }
        }
      }

      if (type === 'input') {
        if (isFunction(callback)) {
          this._buttons[id].callback = callback
          domNode.addEventListener('change', this._buttons[id].callback)
        }
      }
      return id
    }
  }

  toggleButtonById (id) {
    if (this._buttons[id]) {
      this._buttons[id].state = !this._buttons[id].state

      const on = this._buttons[id].state ? 'button--off' : 'button--on'
      const off = this._buttons[id].state ? 'button--on' : 'button--off'
      this._buttons[id].dom.classList.add(on)
      this._buttons[id].dom.classList.remove(off)
      this._buttons[id].dom2.classList.add(off)
      this._buttons[id].dom2.classList.remove(on)
    }
  }

  removeButton (id) {
    if (this._buttons[id]) {
      if (this._buttons[id].dom) {
        this._buttons[id].dom.removeEventListener('click', this._buttons[id].callback)
      }
      if (this._buttons[id].dom2) {
        this._buttons[id].dom2.removeEventListener('click', this._buttons[id].callback2)
      }
      this._buttons.remove(id)
      return true
    }
    return false
  }
}

export default Menu
