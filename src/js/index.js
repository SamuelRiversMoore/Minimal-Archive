import { openExternalLinksInNewWindow } from './lib/Helpers.js'
import Gallery from './lib/Gallery.js'

document.addEventListener('DOMContentLoaded', () => {
  openExternalLinksInNewWindow()
  const gallery = new Gallery()

  gallery.reset()
})
