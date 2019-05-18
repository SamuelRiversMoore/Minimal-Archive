import Editor from './lib/Editor.js'
import Gallery from './lib/Gallery.js'
import Loader from './lib/Loader.js'

document.addEventListener('DOMContentLoaded', () => {
  (() => new Loader())()
  const gallery = new Gallery({
    gallerySelector: '.Gallery',
    imageSelector: '.Image',
    lazyloadSelector: '.lazy'
  })

  ;(() => new Editor({
    gallery: gallery
  }))()

  gallery.reset()
})
