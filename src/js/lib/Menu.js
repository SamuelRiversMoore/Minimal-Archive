import {
  isDomNode,
  isFunction,
  uuidv4
} from './Helpers.js'

const mergeSettings = (options) => {
  const settings = {
  }

  for (const attrName in options) {
    settings[attrName] = options[attrName]
  }

  return settings
}

class Menu {
  constructor (options) {
    this.config = mergeSettings(options)
    this.init()
  }

  init () {
    this._buttons = []
    this._callback = null
  }

  addButton (options) {
    const {
      domNode,
      callback,
      type,
      domNode2,
      callback2
    } = this.getButtonOptions(options)
    const id = uuidv4()

    if (isDomNode(domNode)) {
      this._buttons[id] = {}
      this._buttons[id].dom = domNode

      if (isFunction(callback)) {
        this._buttons[id].callback = callback
        domNode.addEventListener('click', callback)
      }

      if (type === 'toggle') {
        this._buttons[id].dom = domNode
        this._buttons[id].dom2 = domNode2
        this._buttons[id].state = false
        domNode.addEventListener('click', () => this.toggleButtonById(id))
        domNode2.addEventListener('click', () => this.toggleButtonById(id))
        if (isFunction(callback2)) {
          this._buttons[id].callback2 = callback2
          domNode2.addEventListener('click', callback2)
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

  getButtonOptions (options) {
    const result = {
      domNode: undefined,
      callback: undefined,
      type: 'regular',
      domNode2: undefined,
      callback2: undefined
    }

    for (const attrName in options) {
      result[attrName] = options[attrName]
    }
    return result
  }

  removeButton (id) {
    if (this._buttons[id]) {
      this._buttons[id].removeEventListener('click', this._callback)
      this._buttons.remove(id)
      return true
    }
    return false
  }
}

export default Menu
