/* global crypto, fetch, performance, requestAnimationFrame, window, Element, HTMLDocument */

/**
 * Tests two Objects / arrays equality
 * @param  {Object | Array} a [description]
 * @param  {Object | Array} other [description]
 * @return {Boolean}
 */
export const areObjectsEqual = (a, b) => {
  const type = Object.prototype.toString.call(a)

  if (type !== Object.prototype.toString.call(b)) {
    return false
  }

  if (['[object Array]', '[object Object]'].indexOf(type) < 0) {
    return false
  }

  const aLen = type === '[object Array]' ? a.length : Object.keys(a).length
  const bLen = type === '[object Array]' ? b.length : Object.keys(b).length
  if (aLen !== bLen) {
    return false
  }

  const compare = function (item1, item2) {
    const itemType = Object.prototype.toString.call(item1)

    // If an object or array, compare recursively
    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
      if (!areObjectsEqual(item1, item2)) {
        return false
      }
    } else {
      if (itemType !== Object.prototype.toString.call(item2)) {
        return false
      }
      if (itemType === '[object Function]') {
        if (item1.toString() !== item2.toString()) {
          return false
        }
      } else {
        if (item1 !== item2) {
          return false
        }
      }
    }
  }

  // Compare properties
  if (type === '[object Array]') {
    for (var i = 0; i < aLen; i++) {
      if (compare(a[i], b[i]) === false) {
        return false
      }
    }
  } else {
    for (var key in a) {
      if (a.hasOwnProperty(key)) {
        if (compare(a[key], b[key]) === false) {
          return false
        }
      }
    }
  }

  return true
}

/**
 * Returns url basename
 * @param  {string} url
 * @return {string}
 */
export const basename = (url) => {
  return url.split(/[\\/]/).pop()
}

/**
 * Returns the base url for a specified url part
 * @param  {string} segment
 * @return {string}
 */
export const baseUrl = (segment) => {
  // get the segments
  const pathArray = window.location.pathname.split('/')
  // find where the segment is located
  const indexOfSegment = pathArray.indexOf(segment)
  // make base_url be the origin plus the path to the segment
  return window.location.origin + pathArray.slice(0, indexOfSegment).join('/') + '/'
}

/**
 * Interface to fetch api
 * methods:
 *   newRequest -> takes a url with data, credentials and headers and executes request
 */
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

/**
 * Converts html string to dom node
 * @param  {string} html HTML string to be processed
 * @return {DOMNode}      valid DOMNode
 */
export const htmlToElement = (html) => {
  const template = document.createElement('template')

  // removing extra white spaces
  html = html.trim()
  template.innerHTML = html
  return template.content.firstChild
}

/**
 * Tests if input is a DOMNode
 * @param  {any} input input
 * @return {Boolean}
 */
export const isDomNode = (input) => {
  return input instanceof Element || input instanceof HTMLDocument
}

/**
 * Tests if input is function
 * @param  {any} input
 * @return {Boolean}
 */
export const isFunction = (input) => {
  return input instanceof Function
}

export const isHexColor = (input) => {
  const regex = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
  return regex.test(input)
}

/**
 * Provides preventDefault shorthand
 * @param  {event} event
 * @return {[type]}       [description]
 */
export const preventDefaults = (event) => {
  if (event && event.target) {
    event.preventDefault()
    event.stopPropagation()
  }
}

/**
 * Removes HTML content from string
 * @param  {String} str input
 * @return {String}     output
 */
export const removeHtml = (str) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = str
  return tmp.textContent || tmp.innerText
}

/**
 * Removes extension from filename
 * @param  {String} str input
 * @return {String}     output
 */
export const stripExtension = str => {
  return str.replace(/\.[^/.]+$/, '')
}

/**
 * Scrolls to location
 * @param  {Number | DOMNode}   destination Number or domnode
 * @param  {Number}   duration
 * @param  {String}   easing      linear only
 * @param  {Function} callback    callback function to call after scroll
 * @return {null}               no return
 */
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

/**
 * Merges an option object values with a default one if key exists in default
 * @param  {Object} options
 * @return {Object}
 */
export const mergeSettings = (options, defaults = {}) => {
  if (!options) {
    return defaults
  }
  for (const attrName in options) {
    defaults[attrName] = options[attrName]
  }

  return defaults
}

/**
 * Returns a UUIDv4 string
 * @return {String}
 */
export const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}
