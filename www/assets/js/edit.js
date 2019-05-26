(function () {
  'use strict';

  const uuidv4 = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  };

  const baseUrl = (segment) => {
    // get the segments
    const pathArray = window.location.pathname.split('/');
    // find where the segment is located
    const indexOfSegment = pathArray.indexOf(segment);
    // make base_url be the origin plus the path to the segment
    return window.location.origin + pathArray.slice(0, indexOfSegment).join('/') + '/'
  };

  const isEqual = (value, other) => {
    // Get the value type
    const type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) return false

    // If items are not an object or array, return false
    if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false

    // Compare the length of the length of the two items
    const valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
    const otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false

    // Compare two items
    const compare = function (item1, item2) {
      // Get the object type
      const itemType = Object.prototype.toString.call(item1);

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
    };

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
  };

  const isDomNode = (element) => {
    return element instanceof Element || element instanceof HTMLDocument
  };

  const stripHtmlTags = (str) => {
    if (typeof str === 'string') {
      return str.replace(/(<([^>]+)>)/ig, '')
    }
  };

  const stripExtension = str => {
    return str.replace(/\.[^/.]+$/, '')
  };

  const scrollTo = (destination, duration = 200, easing = 'linear', callback) => {
    const easings = {
      linear (t) {
        return t
      }
    };

    const start = window.pageYOffset;
    const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

    const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
    const destinationOffset = typeof destination === 'number' ? destination : destination.offsetTop;
    const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);

    if ('requestAnimationFrame' in window === false) {
      window.scroll(0, destinationOffsetToScroll);
      if (callback) {
        callback();
      }
      return
    }

    function scroll () {
      const now = 'now' in window.performance ? performance.now() : new Date().getTime();
      const time = Math.min(1, ((now - startTime) / duration));
      const timeFunction = easings[easing](time);
      window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));

      if (window.pageYOffset === destinationOffsetToScroll) {
        if (callback) {
          callback();
        }
        return
      }

      requestAnimationFrame(scroll);
    }

    scroll();
  };

  const htmlToElement = (html) => {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild
  };

  class Fetch {
    newRequest (url, request, credentials = 'same-origin', headers = { 'Content-Type': 'application/x-www-form-urlencoded' }) {
      function processResponse (response) {
        return new Promise((resolve, reject) => {
          // will resolve or reject depending on status, will pass both "status" and "data" in either case
          let func;
          response.status < 400 ? func = resolve : func = reject;
          response.json().then(data => func({
            'status': response.status,
            'code': data.code,
            'data': data.data,
            'message': data.message
          }));
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
            resolve(response);
          })
          .catch(response => {
            console.log(response);
            reject(response.message);
          });
      })
    }
  }

  const API_URL = baseUrl() + '/api';
  const API_UPLOAD = 'upload';
  const API_SAVE = 'save';

  const SELECTOR_TITLE = '.title';
  const SELECTOR_NOTE = '.note';

  const EVENT_RESET = 'reset';
  const EVENT_STATUS_CHANGE = 'status-change';
  const EVENT_LOADED = 'loaded';
  const EVENT_LOADING = 'loading';
  const EVENT_IMAGE_UPDATE = 'image-update';

  const runningOnBrowser = typeof window !== 'undefined';

  const isBot =
    (runningOnBrowser && !('onscroll' in window)) ||
    (typeof navigator !== 'undefined' &&
      /(gle|ing|ro)bot|crawl|spider/i.test(navigator.userAgent));

  const supportsIntersectionObserver =
    runningOnBrowser && 'IntersectionObserver' in window;

  const supportsClassList =
    runningOnBrowser && 'classList' in document.createElement('p');

  const defaultSettings = {
    elements_selector: 'img',
    container: isBot || runningOnBrowser ? document : null,
    threshold: 300,
    thresholds: null,
    data_src: 'src',
    data_srcset: 'srcset',
    data_sizes: 'sizes',
    data_bg: 'bg',
    class_loading: 'loading',
    class_loaded: 'loaded',
    class_error: 'error',
    load_delay: 0,
    auto_unobserve: true,
    callback_enter: null,
    callback_exit: null,
    callback_reveal: null,
    callback_loaded: null,
    callback_error: null,
    callback_finish: null
  };

  var getInstanceSettings = customSettings => {
    return Object.assign({}, defaultSettings, customSettings)
  };

  const dataPrefix = 'data-';
  const processedDataName = 'was-processed';
  const timeoutDataName = 'll-timeout';
  const trueString = 'true';

  const getData = (element, attribute) => {
    return element.getAttribute(dataPrefix + attribute)
  };

  const setData = (element, attribute, value) => {
    var attrName = dataPrefix + attribute;
    if (value === null) {
      element.removeAttribute(attrName);
      return
    }
    element.setAttribute(attrName, value);
  };

  const setWasProcessedData = element =>
    setData(element, processedDataName, trueString);

  const getWasProcessedData = element =>
    getData(element, processedDataName) === trueString;

  const setTimeoutData = (element, value) =>
    setData(element, timeoutDataName, value);

  const getTimeoutData = element => getData(element, timeoutDataName);

  const purgeProcessedElements = elements => {
    return elements.filter(element => !getWasProcessedData(element))
  };

  const purgeOneElement = (elements, elementToPurge) => {
    return elements.filter(element => element !== elementToPurge)
  };

  /* Creates instance and notifies it through the window element */
  const createInstance = function (classObj, options) {
    var event;
    let eventString = 'LazyLoad::Initialized';
    let instance = new classObj(options);
    try {
      // Works in modern browsers
      event = new CustomEvent(eventString, { detail: { instance } });
    } catch (err) {
      // Works in Internet Explorer (all versions)
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventString, false, false, { instance });
    }
    window.dispatchEvent(event);
  };

  /* Auto initialization of one or more instances of lazyload, depending on the
      options passed in (plain object or an array) */
  function autoInitialize (classObj, options) {
    if (!options) {
      return
    }
    if (!options.length) {
      // Plain object
      createInstance(classObj, options);
    } else {
      // Array of objects
      for (let i = 0, optionsItem; (optionsItem = options[i]); i += 1) {
        createInstance(classObj, optionsItem);
      }
    }
  }

  const callbackIfSet = (callback, argument) => {
    if (callback) {
      callback(argument);
    }
  };

  const updateLoadingCount = (instance, plusMinus) => {
    instance._loadingCount += plusMinus;
    if (instance._elements.length === 0 && instance._loadingCount === 0) {
      callbackIfSet(instance._settings.callback_finish);
    }
  };

  const getSourceTags = parentTag => {
    let sourceTags = [];
    for (let i = 0, childTag; (childTag = parentTag.children[i]); i += 1) {
      if (childTag.tagName === 'SOURCE') {
        sourceTags.push(childTag);
      }
    }
    return sourceTags
  };

  const setAttributeIfValue = (element, attrName, value) => {
    if (!value) {
      return
    }
    element.setAttribute(attrName, value);
  };

  const setImageAttributes = (element, settings) => {
    setAttributeIfValue(
      element,
      'sizes',
      getData(element, settings.data_sizes)
    );
    setAttributeIfValue(
      element,
      'srcset',
      getData(element, settings.data_srcset)
    );
    setAttributeIfValue(element, 'src', getData(element, settings.data_src));
  };

  const setSourcesImg = (element, settings) => {
    const parent = element.parentNode;

    if (parent && parent.tagName === 'PICTURE') {
      let sourceTags = getSourceTags(parent);
      sourceTags.forEach(sourceTag => {
        setImageAttributes(sourceTag, settings);
      });
    }

    setImageAttributes(element, settings);
  };

  const setSourcesIframe = (element, settings) => {
    setAttributeIfValue(element, 'src', getData(element, settings.data_src));
  };

  const setSourcesVideo = (element, settings) => {
    let sourceTags = getSourceTags(element);
    sourceTags.forEach(sourceTag => {
      setAttributeIfValue(
        sourceTag,
        'src',
        getData(sourceTag, settings.data_src)
      );
    });
    setAttributeIfValue(element, 'src', getData(element, settings.data_src));
    element.load();
  };

  const setSourcesBgImage = (element, settings) => {
    const srcDataValue = getData(element, settings.data_src);
    const bgDataValue = getData(element, settings.data_bg);

    if (srcDataValue) {
      element.style.backgroundImage = `url("${srcDataValue}")`;
    }

    if (bgDataValue) {
      element.style.backgroundImage = bgDataValue;
    }
  };

  const setSourcesFunctions = {
    IMG: setSourcesImg,
    IFRAME: setSourcesIframe,
    VIDEO: setSourcesVideo
  };

  const setSources = (element, instance) => {
    const settings = instance._settings;
    const tagName = element.tagName;
    const setSourcesFunction = setSourcesFunctions[tagName];
    if (setSourcesFunction) {
      setSourcesFunction(element, settings);
      updateLoadingCount(instance, 1);
      instance._elements = purgeOneElement(instance._elements, element);
      return
    }
    setSourcesBgImage(element, settings);
  };

  const addClass = (element, className) => {
    if (supportsClassList) {
      element.classList.add(className);
      return
    }
    element.className += (element.className ? ' ' : '') + className;
  };

  const removeClass = (element, className) => {
    if (supportsClassList) {
      element.classList.remove(className);
      return
    }
    element.className = element.className
      .replace(new RegExp('(^|\\s+)' + className + '(\\s+|$)'), ' ')
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
  };

  const genericLoadEventName = 'load';
  const mediaLoadEventName = 'loadeddata';
  const errorEventName = 'error';

  const addEventListener = (element, eventName, handler) => {
    element.addEventListener(eventName, handler);
  };

  const removeEventListener = (element, eventName, handler) => {
    element.removeEventListener(eventName, handler);
  };

  const addEventListeners = (element, loadHandler, errorHandler) => {
    addEventListener(element, genericLoadEventName, loadHandler);
    addEventListener(element, mediaLoadEventName, loadHandler);
    addEventListener(element, errorEventName, errorHandler);
  };

  const removeEventListeners = (element, loadHandler, errorHandler) => {
    removeEventListener(element, genericLoadEventName, loadHandler);
    removeEventListener(element, mediaLoadEventName, loadHandler);
    removeEventListener(element, errorEventName, errorHandler);
  };

  const eventHandler = function (event, success, instance) {
    var settings = instance._settings;
    const className = success ? settings.class_loaded : settings.class_error;
    const callback = success
      ? settings.callback_loaded
      : settings.callback_error;
    const element = event.target;

    removeClass(element, settings.class_loading);
    addClass(element, className);
    callbackIfSet(callback, element);

    updateLoadingCount(instance, -1);
  };

  const addOneShotEventListeners = (element, instance) => {
    const loadHandler = event => {
      eventHandler(event, true, instance);
      removeEventListeners(element, loadHandler, errorHandler);
    };
    const errorHandler = event => {
      eventHandler(event, false, instance);
      removeEventListeners(element, loadHandler, errorHandler);
    };
    addEventListeners(element, loadHandler, errorHandler);
  };

  const managedTags = ['IMG', 'IFRAME', 'VIDEO'];

  const onEnter = (element, instance) => {
    const settings = instance._settings;
    callbackIfSet(settings.callback_enter, element);
    if (!settings.load_delay) {
      revealAndUnobserve(element, instance);
      return
    }
    delayLoad(element, instance);
  };

  const revealAndUnobserve = (element, instance) => {
    var observer = instance._observer;
    revealElement(element, instance);
    if (observer && instance._settings.auto_unobserve) {
      observer.unobserve(element);
    }
  };

  const onExit = (element, instance) => {
    const settings = instance._settings;
    callbackIfSet(settings.callback_exit, element);
    if (!settings.load_delay) {
      return
    }
    cancelDelayLoad(element);
  };

  const cancelDelayLoad = element => {
    var timeoutId = getTimeoutData(element);
    if (!timeoutId) {
      return // do nothing if timeout doesn't exist
    }
    clearTimeout(timeoutId);
    setTimeoutData(element, null);
  };

  const delayLoad = (element, instance) => {
    var loadDelay = instance._settings.load_delay;
    var timeoutId = getTimeoutData(element);
    if (timeoutId) {
      return // do nothing if timeout already set
    }
    timeoutId = setTimeout(function () {
      revealAndUnobserve(element, instance);
      cancelDelayLoad(element);
    }, loadDelay);
    setTimeoutData(element, timeoutId);
  };

  const revealElement = (element, instance, force) => {
    var settings = instance._settings;
    if (!force && getWasProcessedData(element)) {
      return // element has already been processed and force wasn't true
    }
    if (managedTags.indexOf(element.tagName) > -1) {
      addOneShotEventListeners(element, instance);
      addClass(element, settings.class_loading);
    }
    setSources(element, instance);
    setWasProcessedData(element);
    callbackIfSet(settings.callback_reveal, element);
    callbackIfSet(settings.callback_set, element);
  };

  const isIntersecting = entry =>
    entry.isIntersecting || entry.intersectionRatio > 0;

  const getObserverSettings = settings => ({
    root: settings.container === document ? null : settings.container,
    rootMargin: settings.thresholds || settings.threshold + 'px'
  });

  const setObserver = instance => {
    if (!supportsIntersectionObserver) {
      return false
    }
    instance._observer = new IntersectionObserver(entries => {
      entries.forEach(entry =>
        isIntersecting(entry)
          ? onEnter(entry.target, instance)
          : onExit(entry.target, instance)
      );
    }, getObserverSettings(instance._settings));
    return true
  };

  const LazyLoad = function (customSettings, elements) {
    this._settings = getInstanceSettings(customSettings);
    this._loadingCount = 0;
    setObserver(this);
    this.update(elements);
  };

  LazyLoad.prototype = {
    update: function (elements) {
      const settings = this._settings;
      const _elements =
        elements ||
        settings.container.querySelectorAll(settings.elements_selector);

      this._elements = purgeProcessedElements(
        Array.prototype.slice.call(_elements) // NOTE: nodeset to array for IE compatibility
      );

      if (isBot || !this._observer) {
        this.loadAll();
        return
      }

      this._elements.forEach(element => {
        this._observer.observe(element);
      });
    },

    destroy: function () {
      if (this._observer) {
        this._elements.forEach(element => {
          this._observer.unobserve(element);
        });
        this._observer = null;
      }
      this._elements = null;
      this._settings = null;
    },

    load: function (element, force) {
      revealElement(element, this, force);
    },

    loadAll: function () {
      var elements = this._elements;
      elements.forEach(element => {
        revealAndUnobserve(element, this);
      });
    }
  };

  /* Automatic instances creation if required (useful for async script loading) */
  if (runningOnBrowser) {
    autoInitialize(LazyLoad, window.lazyLoadOptions);
  }

  const mergeSettings = (options) => {
    const settings = {
      dom: null,
      filename: null,
      active: true,
      url: null,
      caption: null,
      imageSelector: '.Image',
      lazyloadSelector: '.lazy'
    };

    for (const attrName in options) {
      settings[attrName] = options[attrName];
    }

    return settings
  };

  class Image {
    constructor (options) {
      this.config = mergeSettings(options);
      this.dispatchStatusUpdate = this.dispatchStatusUpdate.bind(this);

      const {
        url,
        filename,
        caption,
        dom,
        active
      } = this.config;

      this._id = uuidv4();
      this._dom = isDomNode(dom) ? dom : this.generateDom(url, filename, caption);
      if (!this._dom) {
        console.warn('%o is not a dom element. Can\'t get image dom.', dom);
      }
      this._src = url;
      this._caption = caption;
      this._filename = filename;
      this._captionSelector = this._dom && this._dom.querySelector('[contenteditable]');
      this._active = active;
      this._status = false;

      this.applyStyle();
      this.initListeners();
    }

    initListeners () {
      if (this._active && this._dom) {
        this._dom.addEventListener('click', this.toggleStatus.bind(this));
        this._dom.addEventListener(EVENT_STATUS_CHANGE, this.applyStyle.bind(this));
      }
      document.addEventListener(EVENT_RESET, (e) => {
        this._status = false;
        this.dispatchStatusUpdate();
      });

      if (this._captionSelector) {
        // 1. Listen for changes of the contenteditable element
        this._captionSelector.addEventListener('input', (e) => {
          // 2. Retrive the text from inside the element
          this._caption = this._captionSelector.innerHTML;
        });
      }
    }

    toggleStatus (event) {
      this._status = !this._status;
      this.dispatchStatusUpdate();
    }

    dispatchStatusUpdate (event) {
      if (this._dom) {
        this._dom.dispatchEvent(new Event(EVENT_STATUS_CHANGE));
      }
      document.dispatchEvent(new CustomEvent(EVENT_IMAGE_UPDATE, {
        detail: {
          image: this._status ? this : null
        }
      }));
    }

    applyStyle () {
      if (this._dom) {
        if (this._status) {
          this._dom.classList.add('Image--active');
          this._dom.classList.remove('Image--inactive');
        } else {
          this._dom.classList.remove('Image--active');
          this._dom.classList.add('Image--inactive');
        }
      }
    }

    generateDom (src, filename, caption) {
      if (src) {
        return htmlToElement(`<div class="Image">
        <div class="Image__container">
          <img class="lazy miniarch" src="/assets/css/loading.gif" data-src="${src}" data-filename="${filename}" title="${filename} preview" />
        </div>
        <div class="Image__caption"><span contenteditable="true">${caption}</span></div>
        </div>`)
      } else {
        return null
      }
    }

    getId () {
      return this._id
    }

    set dom (dom) {
      this._dom = dom;
    }
    get dom () {
      return this._dom ? this._dom : this.generateDom(this._src, this._filename, this._caption)
    }

    set status (status) {
      this._status = status;
      this._dom && this._dom.dispatchEvent(new Event(EVENT_STATUS_CHANGE));
    }
    get status () {
      return this._status
    }

    set caption (caption) {
      this._caption = caption;
    }
    get caption () {
      return this._caption
    }

    set filename (filename) {
      this._filename = filename;
    }
    get filename () {
      return this._filename
    }

    set src (src) {
      this._src = src;
    }
    get src () {
      return this._src
    }
  }

  const mergeSettings$1 = (options) => {
    const settings = {
      gallerySelector: '.Gallery',
      imageSelector: '.Image',
      lazyloadSelector: '.lazy',
      active: true
    };

    for (const attrName in options) {
      settings[attrName] = options[attrName];
    }

    return settings
  };

  class Gallery {
    constructor (options) {
      this.config = mergeSettings$1(options);
      this.init();
    }

    init () {
      const {
        gallerySelector,
        imageSelector,
        lazyloadSelector,
        active
      } = this.config;
      const images = document.querySelectorAll(imageSelector);

      this.keyHandler = this.keyHandler.bind(this);
      this.updateImage = this.updateImage.bind(this);
      this.gallery = document.querySelector(gallerySelector);
      this._current = null;

      if (!this.gallery) {
        console.warn(`\nModule: Gallery.js\nWarning: No Gallery dom node found in document.\nCause: No gallerySelector provided.\nResult: Adding images may fail.`);
      }

      let i = -1;
      this._images = [];
      while (++i < images.length) {
        const image = this.getNewImage(images[i], this.active);
        if (image) {
          this._images.push(image);
        }
      }

      this.lazyload = new LazyLoad({
        elements_selector: lazyloadSelector
      });

      if (active) {
        this.activate();
      }
    }

    getNewImage (dom, active) {
      if (!dom || !isDomNode(dom)) {
        return null
      }
      const url = dom.querySelector('img') ? dom.querySelector('img').src : null;
      const datafilename = dom.querySelector('img') && dom.querySelector('img').getAttribute('data-filename') ? dom.querySelector('img').getAttribute('data-filename') : null;
      const filename = datafilename ? datafilename.substring(datafilename.lastIndexOf('/') + 1) : dom.querySelector('img') ? dom.querySelector('img').src.substring(dom.querySelector('img').src.lastIndexOf('/') + 1) : null;
      const caption = dom.querySelector('.Image__caption span') ? dom.querySelector('.Image__caption span').innerHTML : null;

      return new Image(
        {
          url: url,
          filename: filename,
          caption: caption,
          dom: dom,
          active: active
        })
    }

    activate () {
      this.active = true;
      this.gallery.classList.remove('Gallery--inactive');
      this.gallery.classList.add('Gallery--active');
      this.initListeners();
    }

    deactivate () {
      this.active = false;
      this.gallery.classList.remove('Gallery--active');
      this.gallery.classList.add('Gallery--inactive');
      this.removeListeners();
    }

    toggleActive () {
      this.active = !this.active;
    }

    initListeners () {
      document.addEventListener(EVENT_IMAGE_UPDATE, this.updateImage);
      document.addEventListener('keyup', this.keyHandler);
    }

    removeListeners () {
      document.removeEventListener(EVENT_IMAGE_UPDATE, this.updateImage);
      document.removeEventListener('keyup', this.keyHandler);
    }

    updateImage (e) {
      if (e.detail && e.detail.image && e.detail.image instanceof Image) {
        this.updateCurrentImage(e.detail.image);
      } else {
        this.updateCurrentImage(null);
      }
    }

    updateCurrentImage (image) {
      if (this._current instanceof Image) {
        this._current.status = false;
      }
      this._current = image;
      if (this._current instanceof Image) {
        this._current.status = true;
        scrollTo(this._current.dom);
      } else {
        scrollTo(0);
      }
    }

    keyHandler (e) {
      switch (e.key) {
        case 'ArrowLeft':
          if (this._current) {
            e.preventDefault();
            this.prev();
          }
          break
        case 'ArrowRight':
          if (this._current) {
            e.preventDefault();
            this.next();
          }
          break
        case 'Escape':
          this.reset();
          break
      }
    }

    addImage (dom) {
      if (dom && document.body.contains(dom)) {
        this._images.push(this.getNewImage(dom, this.active));
      } else if (dom && !document.body.contains(dom)) {
        const images = document.querySelectorAll(this.config.imageSelector);
        if (images.length) {
          images[images.length - 1].parentNode.insertBefore(dom, images[images.length - 1].nextSibling);
        } else {
          this.gallery.appendChild(dom);
        }
        this._images.push(this.getNewImage(dom, this.active));
      }
      this.lazyload.update();
    }

    set current (image) {
      this.updateCurrentImage(image);
    }
    get current () {
      return this._current
    }

    get images () {
      return this._images
    }

    set images (images) {
      this._images = images;
    }

    setImages (images) {
      if (!images || !images.length) {
        return
      }
      this.gallery.innerHTML = null;
      this.images = [];
      let i = -1;
      while (++i < images.length) {
        this.addImage(this.getImageDom(images[i].src, images[i].filename));
      }
    }

    getImageDom (src, filename) {
      if (src) {
        return htmlToElement(`<div class="Image">
        <div class="Image__container">
          <img class="lazy miniarch" src="/assets/css/loading.gif" data-src="${src}" data-filename="${filename}" title="${filename} preview" />
        </div>
        <div class="Image__caption"><span contenteditable="true">${stripExtension(filename)}</span></div>
        </div>`)
      }
    }

    next () {
      const index = this.images.indexOf(this._current);
      if (index >= 0 && index <= this.images.length - 2) {
        this.updateCurrentImage(this.images[index + 1]);
      } else if (index > this.images.length - 2) {
        this.updateCurrentImage(this.images[0]);
      }
    }

    prev () {
      const index = this.images.indexOf(this._current);
      if (index > 0) {
        this.updateCurrentImage(this.images[index - 1]);
      } else if (index === 0) {
        this.updateCurrentImage(this.images[this.images.length - 1]);
      }
    }

    reset () {
      document.dispatchEvent(new Event(EVENT_RESET));
    }
  }

  function ProgressBar (progressBarSelector) {
    let uploadProgress = [];
    const progressBar = document.querySelector(progressBarSelector);

    if (!progressBar) {
      console.warn('ProgressBar, no selector provided!');
    }

    const updateProgress = (fileNumber, percent) => {
      uploadProgress[fileNumber] = percent;
      let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length;
      console.debug('update', fileNumber, percent, total);
      if (progressBar) {
        progressBar.value = total;
      }
    };

    const initializeProgress = (numFiles) => {
      if (!progressBar) {
        console.warn('ProgressBar, no selector provided!');
      } else {
        progressBar.value = 0;
      }
      uploadProgress = [];
      for (let i = numFiles; i > 0; i--) {
        uploadProgress.push(0);
      }
    };

    return {
      updateProgress: updateProgress,
      initializeProgress: initializeProgress
    }
  }

  const mergeSettings$2 = (options) => {
    const settings = {
      dropAreaSelector: '#drop-area',
      fileInputSelector: '#file-input',
      progressBarSelector: '.progress-bar',
      previewBtnSelector: '.editbutton.preview',
      cancelBtnSelector: '.editbutton.cancel',
      saveBtnSelector: '.editbutton.save',
      gallery: new Gallery({
        gallerySelector: '.Gallery',
        imageSelector: '.Image',
        lazyloadSelector: '.lazy'
      }),
      fullscreenDropZone: true
    };

    for (const attrName in options) {
      settings[attrName] = options[attrName];
    }

    return settings
  };

  class Editor {
    constructor (options) {
      this.config = mergeSettings$2(options);
      this.uploadFile = this.uploadFile.bind(this);
      this.previewFile = this.previewFile.bind(this);
      this.files = [];
      this.init();
    }

    init () {
      const {
        gallery,
        dropAreaSelector,
        fullscreenDropZone,
        fileInputSelector,
        progressBarSelector,
        previewBtnSelector,
        cancelBtnSelector,
        saveBtnSelector
      } = this.config;

      this.gallery = gallery;
      this.dropArea = document.querySelector(dropAreaSelector);
      this.fileInput = document.querySelector(fileInputSelector);
      this.fullscreenDropZone = Boolean(fullscreenDropZone);
      this.cancelBtn = document.querySelector(cancelBtnSelector);
      this.previewBtn = document.querySelector(previewBtnSelector);
      this.saveBtn = document.querySelector(saveBtnSelector);

      if (!this.gallery) {
        console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No Gallery provided.\nResult: Editor can't initialize.`);
        return
      } else {
        this.gallery.deactivate();
        this.gallery.reset();
      }
      if (!this.dropArea) {
        console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No drop area with selector [${dropAreaSelector}] found in document.\nResult: Editor can't initialize.`);
        return
      }
      if (!this.fileInput) {
        console.warn(`\nModule: Editor.js\nWarning: Can't create file input listener.\nCause: No file input with selector [${fileInputSelector}] found in document.\nResult: Upload by file input button is disabled.`);
      }
      if (!this.saveBtn) {
        console.warn(`Module: Editor.js\nWarning: Can't add preview functionality.\nCause: No preview button with selector [${previewBtnSelector}] found in document.\nResult: Previewing is disabled.`);
      }
      if (!this.saveBtn) {
        console.warn(`Module: Editor.js\nWarning: Can't add save functionality.\nCause: No save button with selector [${saveBtnSelector}] found in document.\nResult: Saving is disabled.`);
      }
      if (!this.cancelBtn) {
        console.warn(`Module: Editor.js\nWarning: Can't add cancel functionality.\nCause: No cancel button with selector [${cancelBtnSelector}] found in document.\nResult: Undoing changes is disabled.`);
      }
      this.progressbar = new ProgressBar(progressBarSelector);
      this.initListeners();
      this.backup = this.getState();
    }

    initListeners () {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        this.dropArea.addEventListener(eventName, this.preventDefaults, false);
        document.body.addEventListener(eventName, this.preventDefaults, false);
      });

      if (this.fullscreenDropZone) {
  ['dragenter'].forEach(eventName => {
          document.addEventListener(eventName, (e) => {
            this.dropArea.classList.add('active');
          }, true);
        })
        ;['dragleave', 'drop'].forEach(eventName => {
          this.dropArea.addEventListener(eventName, (e) => {
            this.dropArea.classList.remove('active');
          }, true);
        });
      }
  ['dragenter', 'dragover'].forEach(eventName => {
        this.dropArea.addEventListener(eventName, () => {
          this.highlight();
        }, false);
      })

      ;['dragleave', 'drop'].forEach(eventName => {
        this.dropArea.addEventListener(eventName, () => {
          this.unhighlight();
        }, false);
      });

      // Handle dropped files
      this.dropArea.addEventListener('drop', (e) => {
        this.handleDrop(e);
      }, false);

      if (this.fileInput) {
        this.fileInput.addEventListener('change', (e) => {
          if (e.target && e.target.files) {
            this.handleFiles(e.target.files);
          }
        });
      }

      if (this.cancelBtn) {
        this.cancelBtn.addEventListener('click', (e) => {
          this.cancelChanges();
        });
      }

      if (this.saveBtn) {
        this.saveBtn.addEventListener('click', (e) => {
          this.saveChanges();
        });
      }

      if (this.previewBtn) {
        this.previewBtn.addEventListener('click', (e) => {
          this.previewChanges();
        });
      }
    }

    cancelChanges () {
      if (!isEqual(this.getState(), this.backup)) {
        this.save(this.backup);
      }
    }

    saveChanges () {
      const state = this.getState();
      if (!isEqual(state, this.backup)) {
        this.save(state);
      }
    }

    save (data) {
      document.dispatchEvent(new Event(EVENT_LOADING));
      this.saveData(data, this.getCsrfToken(this.saveBtn))
        .then((res) => {
          if (res.data.images) {
            this.gallery.setImages(res.data.images);
          }
          this.backup = this.getState();
        })
        .catch(err => console.log(err))
        .finally(() => document.dispatchEvent(new Event(EVENT_LOADED)));
    }

    getState () {
      const result = {
        title: '',
        note: '',
        images: []
      };
      const title = document.querySelector(SELECTOR_TITLE);
      const note = document.querySelector(SELECTOR_NOTE);
      const images = this.gallery.images;

      if (title) {
        result.title = stripHtmlTags(title.innerHTML);
      }
      if (note) {
        result.note = stripHtmlTags(note.innerHTML);
      }
      if (images && images.length) {
        result.images = [...images].map((image) => {
          return {
            id: image.getId(),
            filename: image.filename,
            newfilename: image.caption
          }
        });
      }
      return result
    }

    previewChanges () {
      window.location = baseUrl();
    }

    saveData (data, csrfToken) {
      return new Promise((resolve, reject) => {
        const api = new Fetch();
        const url = API_URL;
        const formData = new FormData();

        formData.append('data', JSON.stringify(data));
        formData.append('action', API_SAVE);
        formData.append('csrf_token', csrfToken);
        api.newRequest(url, formData)
          .then(data => resolve(data))
          .catch(err => reject(err));
      })
    }
    uploadFile (file, csrfToken, i) {
      return new Promise((resolve, reject) => {
        const api = new Fetch();
        const url = API_URL;
        const formData = new FormData();

        formData.append('file', file);
        formData.append('action', API_UPLOAD);
        formData.append('csrf_token', csrfToken);
        api.newRequest(url, formData)
          .then(data => resolve(data))
          .catch(err => reject(err));
      })
    }

    previewFile (file, filename) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        this.gallery.addImage(this.getPreviewDom(reader.result, filename));
      };
    }

    getPreviewDom (src, filename) {
      if (src) {
        return htmlToElement(`<div class="Image">
        <div class="Image__container">
          <img class="lazy miniarch" src="/assets/css/loading.gif" data-src="${src}" data-filename="${filename}" title="${filename} preview" />
        </div>
        <div class="Image__caption"><span contenteditable="true">${stripExtension(filename)}</span></div>
        </div>`)
      }
    }

    handleFiles (files) {
      files = [...files];
      this.progressbar.initializeProgress(files.length);
      files.forEach(file => {
        this.uploadFile(file, this.getCsrfToken(this.dropArea))
          .then((result) => {
            if (result && result.data && result.data.length && result.data[0]) {
              this.previewFile(file, result.data[0].name);
              this.files.push(result.data[0]);
            }
          })
          .catch(err => {
            console.log(err);
          });
      });
    }

    handleDrop (e) {
      const files = e.dataTransfer.files;
      const imageFiles = [];

      let i = -1;
      while (++i < files.length) {
        if (files[i].type.match(/image.*/)) {
          imageFiles.push(files[i]);
        }
      }
      if (imageFiles.length > 0) {
        this.handleFiles(imageFiles);
      }
    }

    getCsrfToken (domNode) {
      if (domNode && isDomNode(domNode)) {
        const inputElement = domNode.querySelector('[name=csrf_token]');
        return inputElement && inputElement.value
      }
      return undefined
    }

    preventDefaults (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    highlight (e) {
      this.dropArea.classList.add('highlight');
    }

    unhighlight (e) {
      this.dropArea.classList.remove('highlight');
    }
  }

  const mergeSettings$3 = (options) => {
    const settings = {
      selector: 'Loader'
    };

    for (const attrName in options) {
      settings[attrName] = options[attrName];
    }

    return settings
  };

  class Loader {
    constructor (options) {
      this.config = mergeSettings$3(options);
      this.init();
    }

    init () {
      const {
        selector
      } = this.config;
      const content = document.createElement('div');

      content.classList.add('content');
      content.innerHTML = 'Loading...';

      this.dom = document.createElement('aside');
      this.dom.classList.add(selector);
      this.dom.appendChild(content);

      document.body.appendChild(this.dom);
      this.initListeners();
    }

    initListeners () {
      document.addEventListener(EVENT_LOADING, () => {
        this.start();
      });
      document.addEventListener(EVENT_LOADED, () => {
        setTimeout(() => {
          this.stop();
        }, 1000);
      });
    }

    start () {
      this.dom.classList.remove('transition-end');
      this.dom.classList.remove(EVENT_LOADED);
      this.dom.classList.add('transition-start');
      setTimeout(() => {
        this.dom.classList.add(EVENT_LOADING);
      }, 0.25);
    }

    stop () {
      this.dom.classList.remove('transition-start');
      this.dom.classList.remove(EVENT_LOADING);
      this.dom.classList.add(EVENT_LOADED);
      setTimeout(() => {
        this.dom.classList.add('transition-end');
      }, 0.25);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    (() => new Loader())()
    ;(() => new Editor())();
  });

}());
