import Editor from './lib/Editor.js'
import Loader from './lib/Loader.js'
import {
  isDomNode
} from './lib/Helpers.js'

const getCsrfToken = (domNode) => {
  if (domNode && isDomNode(domNode)) {
    const inputElement = domNode.querySelector('[name=csrf_token]')
    return inputElement && inputElement.value
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const bgColorBtnSelector = document.querySelector('#bg_color')
  const textColorBtnSelector = document.querySelector('#text_color')
  const fontfamilyBtnSelector = document.querySelector('#font_family')
  const saveBtnSelector = document.querySelector('.editbutton.save')
  const cancelBtnSelector = document.querySelector('.editbutton.cancel')
  const previewBtnSelector = document.querySelector('.editbutton.preview')

  ;(() => new Loader())()
  const editor = new Editor({
    bgColor: bgColorBtnSelector.value,
    textColor: textColorBtnSelector.value,
    onUpdate: (newState, oldState) => {
      bgColorBtnSelector.value = newState.bgcolor
      bgColorBtnSelector.nextSibling.innerHTML = newState.bgcolor
      textColorBtnSelector.value = newState.textcolor
      textColorBtnSelector.nextSibling.innerHTML = newState.textcolor
    }
  })

  // Save button
  editor.addButton({
    domNode: saveBtnSelector,
    callback: () => {
      editor.actionSave(getCsrfToken(saveBtnSelector))
    },
    csrf_token: getCsrfToken(saveBtnSelector)
  })

  // Cancel button
  editor.addButton({
    domNode: cancelBtnSelector,
    callback: () => {
      editor.actionCancel(getCsrfToken(cancelBtnSelector))
    },
    csrf_token: getCsrfToken(cancelBtnSelector)
  })

  // Preview button
  editor.addButton({
    domNode: previewBtnSelector,
    callback: editor.actionPreview,
    csrf_token: getCsrfToken(previewBtnSelector)
  })

  // Background color selector
  editor.addButton({
    domNode: bgColorBtnSelector,
    type: 'input',
    callback: (e) => {
      editor.bgColor = e.target.value
      e.target.nextSibling.innerHTML = editor.bgColor
    }
  })

  // Text color selector
  editor.addButton({
    domNode: textColorBtnSelector,
    type: 'input',
    callback: (e) => {
      editor.textColor = e.target.value
      e.target.nextSibling.innerHTML = editor.textColor
    }
  })

  // Font family selector
  editor.addButton({
    domNode: fontfamilyBtnSelector,
    type: 'input',
    callback: (e) => {
      editor.fontFamily = e.target.value
    }
  })
})
