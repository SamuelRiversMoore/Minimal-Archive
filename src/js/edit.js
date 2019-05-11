import Editor from './lib/Editor.js'
import Gallery from './lib/Gallery.js'

document.addEventListener('DOMContentLoaded', () => {
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
