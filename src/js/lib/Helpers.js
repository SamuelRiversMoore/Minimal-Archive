export const openExternalLinksInNewWindow = () => {
  const links = document.links
  let i = -1

  while (++i < links.length) {
    if (links[i].hostname !== window.location.hostname) {
      links[i].target = '_blank'
      links[i].setAttribute('rel', 'noopener noreferrer')
    }
  }
}

export const isDomNode = (element) => {
  return element instanceof Element || element instanceof HTMLDocument
}

export const scrollTo = (destination, duration = 200, easing = 'linear', callback) => {
  const easings = {
    linear (t) {
      return t
    }
  }

  const start = window.pageYOffset
  const startTime = 'now' in window.performance ? performance.now() : new Date().getTime()

  const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight)
  const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight
  const destinationOffset = typeof destination === 'number' ? destination : destination.offsetTop
  const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset)

  if ('requestAnimationFrame' in window === false) {
    window.scroll(0, destinationOffsetToScroll)
    if (callback) {
      callback()
    }
    return
  }

  function scroll () {
    const now = 'now' in window.performance ? performance.now() : new Date().getTime()
    const time = Math.min(1, ((now - startTime) / duration))
    const timeFunction = easings[easing](time)
    window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start))

    if (window.pageYOffset === destinationOffsetToScroll) {
      if (callback) {
        callback()
      }
      return
    }

    requestAnimationFrame(scroll)
  }

  scroll()
}
