export const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export const isEqual = (value, other) => {
  // Get the value type
  const type = Object.prototype.toString.call(value)

  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(other)) return false

  // If items are not an object or array, return false
  if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false

  // Compare the length of the length of the two items
  const valueLen = type === '[object Array]' ? value.length : Object.keys(value).length
  const otherLen = type === '[object Array]' ? other.length : Object.keys(other).length
  if (valueLen !== otherLen) return false

  // Compare two items
  const compare = function (item1, item2) {
    // Get the object type
    const itemType = Object.prototype.toString.call(item1)

    // If an object or array, compare recursively
    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
      if (!isEqual(item1, item2)) {
        return false
      }
    } else {
      // If the two items are not the same type, return false
      if (itemType !== Object.prototype.toString.call(item2)) return false

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (itemType === '[object Function]') {
        if (item1.toString() !== item2.toString()) return false
      } else {
        if (item1 !== item2) {
          return false
        }
      }
    }
  }

  // Compare properties
  if (type === '[object Array]') {
    for (var i = 0; i < valueLen; i++) {
      if (compare(value[i], other[i]) === false) return false
    }
  } else {
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        if (compare(value[key], other[key]) === false) return false
      }
    }
  }

  // If nothing failed, return true
  return true
}

export const isDomNode = (element) => {
  return element instanceof Element || element instanceof HTMLDocument
}

export const stripHtmlTags = (str) => {
  if (typeof str === 'string') {
    return str.replace(/(<([^>]+)>)/ig, '')
  }
}

export const stripExtension = str => {
  return str.replace(/\.[^/.]+$/, '')
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
  newRequest (url, request, credentials = 'same-origin', headers = { 'Content-Type': 'application/x-www-form-urlencoded' }) {
    function processResponse (response) {
      return new Promise((resolve, reject) => {
        // will resolve or reject depending on status, will pass both "status" and "data" in either case
        let func
        response.status < 400 ? func = resolve : func = reject
        response.json().then(data => func({
          'status': response.status,
          'code': data.code,
          'data': data.data,
          'message': data.message
        }))
      })
    }

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        body: request,
        credentials: credentials,
        headers: {
          headers
        }
      })
        .then(processResponse)
        .then((response) => {
          resolve(response)
        })
        .catch(response => {
          console.log(response)
          reject(response.message)
        })
    })
  }
}
