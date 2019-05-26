import Editor from './lib/Editor.js'
import Loader from './lib/Loader.js'

document.addEventListener('DOMContentLoaded', () => {
  (() => new Loader())()
  ;(() => new Editor())()
})
