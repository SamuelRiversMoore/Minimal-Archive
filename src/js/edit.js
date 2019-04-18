import Editor from './lib/Editor.js'
import Gallery from './lib/Gallery.js'

document.addEventListener('DOMContentLoaded', () => {
  const gallery = new Gallery({
    image_selector: '.Image',
    lazyload_selector: '.lazy'
  })

  ;(() => new Editor({
    gallery: gallery
  }))()

  gallery.reset()
})
