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
  }

  addButton (domNode, callback) {
    if (isDomNode(domNode)) {
      const id = uuidv4()
      this._buttons[id] = domNode
      if (isFunction(callback)) {
        domNode.addEventListener('click', callback)
      }
      return id
    }
  }

  removeButton (id) {
    if (this._buttons[id]) {
      this._buttons.remove(id)
      return true
    }
    return false
  }
}

export default Menu
