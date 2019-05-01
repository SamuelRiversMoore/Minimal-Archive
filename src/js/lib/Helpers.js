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

export const htmlToElement = (html) => {
  const template = document.createElement('template')
  html = html.trim() // Never return a text node of whitespace as the result
  template.innerHTML = html
  return template.content.firstChild
}

export class Fetch {
  newRequest (url, request, callback, credentials = 'same-origin', headers = { 'Content-Type': 'application/x-www-form-urlencoded' }) {
    fetch(url, {
      method: 'POST',
      body: request,
      credentials: credentials,
      headers: {
        headers
      }
    })
      .then((response) => {
        if (response.status !== 200) {
          console.log(`Problem: ${response.status}`)
          return
        }
        // console.log(response.text())
        response.json().then((data) => this._onRequest(data, callback))
      })
      .catch((err) => {
        console.log(`Fetch Error:`, err)
      })
  }
  _onRequest (data, callback) {
    if (data && data.status) {
      // console.dir(data)
      if (data.status === 200) {
        if (data.action !== 'get_images' && data.user.id === null) {
          window.location.href = '/signup'
        } else {
          callback(data)
        }
      } else if (data.status === 401) {
        window.location.href = '/signup'
      } else {
        console.log('Data fetch error: ', data)
      }
    }
  }
}
