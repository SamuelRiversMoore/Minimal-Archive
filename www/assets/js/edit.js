(function () {
  'use strict';

  /* global crypto, fetch, performance, requestAnimationFrame, window, Element, HTMLDocument */

  /**
   * Tests two Objects / arrays equality
   * @param  {Object | Array} a [description]
   * @param  {Object | Array} other [description]
   * @return {Boolean}
   */
  const areObjectsEqual = (a, b) => {
    const type = Object.prototype.toString.call(a);

    if (type !== Object.prototype.toString.call(b)) {
      return false
    }

    if (['[object Array]', '[object Object]'].indexOf(type) < 0) {
      return false
    }

    const aLen = type === '[object Array]' ? a.length : Object.keys(a).length;
    const bLen = type === '[object Array]' ? b.length : Object.keys(b).length;
    if (aLen !== bLen) {
      return false
    }

    const compare = function (item1, item2) {
      const itemType = Object.prototype.toString.call(item1);

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
    };

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
  };

  /**
   * Returns url basename
   * @param  {string} url
   * @return {string}
   */
  const basename = (url) => {
    return url.split(/[\\/]/).pop()
  };

  /**
   * Returns the base url for a specified url part
   * @param  {string} segment
   * @return {string}
   */
  const baseUrl = (segment = '') => {
    // get the segments
    const pathArray = window.location.pathname.split('/');
    // find where the segment is located
    const indexOfSegment = pathArray.indexOf(segment);
    // make base_url be the origin plus the path to the segment
    return window.location.origin + pathArray.slice(0, indexOfSegment).join('/')
  };

  /**
   * Interface to fetch api
   * methods:
   *   newRequest -> takes a url with data, credentials and headers and executes request
   */
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

  /**
   * Converts html string to dom node
   * @param  {string} html HTML string to be processed
   * @return {DOMNode}      valid DOMNode
   */
  const htmlToElement = (html) => {
    const template = document.createElement('template');

    // removing extra white spaces
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild
  };

  /**
   * Tests if input is a DOMNode
   * @param  {any} input input
   * @return {Boolean}
   */
  const isDomNode = (input) => {
    return input instanceof Element || input instanceof HTMLDocument
  };

  /**
   * Tests if input is function
   * @param  {any} input
   * @return {Boolean}
   */
  const isFunction = (input) => {
    return input instanceof Function
  };

  const isHexColor = (input) => {
    const regex = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
    return regex.test(input)
  };

  /**
   * Provides preventDefault shorthand
   * @param  {event} event
   * @return {[type]}       [description]
   */
  const preventDefaults = (event) => {
    if (event && event.target) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  /**
   * Removes HTML content from string
   * @param  {String} str input
   * @return {String}     output
   */
  const removeHtml = (str) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText
  };

  /**
   * Replace content editable entities by better ones
   * @param  {string} str [description]
   * @return {string}     [description]
   */
  const processContentEditable = (str) => {
    let processed = str.trim();
    processed = processed.replace(/(<div><br>)*<\/div>/g, '<br/>');
    processed = processed.replace(/<div>/g, '');

    return processed
  };

  /**
   * Removes extension from filename
   * @param  {String} str input
   * @return {String}     output
   */
  const stripExtension = str => {
    return str.replace(/\.[^/.]+$/, '')
  };

  /**
   * Scrolls to location
   * @param  {Number | DOMNode}   destination Number or domnode
   * @param  {Number}   duration
   * @param  {String}   easing      linear only
   * @param  {Function} callback    callback function to call after scroll
   * @return {null}               no return
   */
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

  /**
   * Merges an option object values with a default one if key exists in default
   * @param  {Object} options
   * @return {Object}
   */
  const mergeSettings = (options, defaults = {}) => {
    if (!options) {
      return defaults
    }
    for (const attrName in options) {
      defaults[attrName] = options[attrName];
    }

    return defaults
  };

  /**
   * Returns a UUIDv4 string
   * @return {String}
   */
  const uuidv4 = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  };

  class Menu {
    constructor (options) {
      this.config = mergeSettings(options, {});
      this.init();
    }

    init () {
      this._buttons = [];
      this._callback = null;
    }

    getButtonOptions (options) {
      const result = {
        domNode: undefined,
        callback: undefined,
        type: 'simple',
        domNode2: undefined,
        callback2: undefined
      };

      for (const attrName in options) {
        result[attrName] = options[attrName];
      }
      return result
    }

    addButton (options) {
      const id = uuidv4();
      const {
        domNode,
        callback,
        type,
        domNode2,
        callback2
      } = this.getButtonOptions(options);

      if (isDomNode(domNode)) {
        this._buttons[id] = {};
        this._buttons[id].dom = domNode;

        if (type === 'simple') {
          if (isFunction(callback)) {
            this._buttons[id].callback = callback;
            this._buttons[id].dom.classList.add('clickable');
            domNode.addEventListener('click', this._buttons[id].callback);
          }
        }

        if (type === 'toggle') {
          this._buttons[id].state = false;
          this._buttons[id].dom.classList.add('clickable');
          domNode.addEventListener('click', () => this.toggleButtonById(id));
          if (isFunction(callback)) {
            this._buttons[id].callback = callback;
            domNode.addEventListener('click', this._buttons[id].callback);
          }
          if (isDomNode(domNode2)) {
            this._buttons[id].dom2 = domNode2;
            this._buttons[id].dom2.classList.add('clickable');
            domNode2.addEventListener('click', () => this.toggleButtonById(id));
            if (isFunction(callback2)) {
              this._buttons[id].callback2 = callback2;
              domNode2.addEventListener('click', this._buttons[id].callback2);
            }
          }
        }

        if (type === 'input') {
          if (isFunction(callback)) {
            this._buttons[id].callback = callback;
            domNode.addEventListener('change', this._buttons[id].callback);
          }
        }
        return id
      }
    }

    toggleButtonById (id) {
      if (this._buttons[id]) {
        this._buttons[id].state = !this._buttons[id].state;

        const on = this._buttons[id].state ? 'button--off' : 'button--on';
        const off = this._buttons[id].state ? 'button--on' : 'button--off';
        this._buttons[id].dom.classList.add(on);
        this._buttons[id].dom.classList.remove(off);
        this._buttons[id].dom2.classList.add(off);
        this._buttons[id].dom2.classList.remove(on);
      }
    }

    removeButton (id) {
      if (this._buttons[id]) {
        if (this._buttons[id].dom) {
          this._buttons[id].dom.removeEventListener('click', this._buttons[id].callback);
        }
        if (this._buttons[id].dom2) {
          this._buttons[id].dom2.removeEventListener('click', this._buttons[id].callback2);
        }
        this._buttons.remove(id);
        return true
      }
      return false
    }
  }

  const API_URL = baseUrl() + '/api';
  const API_UPLOAD = 'upload';
  const API_SAVE = 'save';

  const SELECTOR_TITLE = 'main header .title';
  const SELECTOR_NOTE = '.note';

  const EVENT_IMAGE_UPDATE = 'image-update';
  const EVENT_LOADED = 'loaded';
  const EVENT_LOADING = 'loading';
  const EVENT_MODAL_UPDATE = 'modal-update';
  const EVENT_STATUS_CHANGE = 'status-change';
  const EVENT_RESET = 'reset';

  /* global CustomEvent */

  class Modal {
    constructor (options) {
      const defaults = {
        target: false,
        content: null,
        customClass: null,
        active: false,
        triggers: null
      };
      this.config = mergeSettings(options, defaults);
      this.keyHandler = this.keyHandler.bind(this);
      this.init();
    }

    init () {
      const {
        target,
        content,
        active,
        triggers
      } = this.config;

      this._active = false;
      this._id = uuidv4();
      this._triggers = triggers && isDomNode(triggers) ? [triggers] : triggers && typeof triggers === 'string' ? document.querySelectorAll(triggers) : false;
      this._content = content && isDomNode(content) ? content : content && content !== false ? htmlToElement(content) : null;
      this._target = target && isDomNode(target) ? target : target && typeof target === 'string' ? document.querySelector(target) : false;

      this._dom = this.setupDom(this._target, this._content, this._id);
      this._bodyoverflow = document.body.style.overflow;
      this.setupListeners();

      if (active) {
        this.activate();
      } else {
        this.deactivate();
      }
    }

    activate () {
      this.dispatchStatusUpdate(true);
    }

    deactivate () {
      this.dispatchStatusUpdate(false);
    }

    toggle () {
      this.dispatchStatusUpdate(!this._active);
    }

    setupListeners () {
      if (this._triggers) {
        let i = -1;
        while (++i < this._triggers.length) {
          this._triggers[i].addEventListener('click', this.toggle.bind(this));
        }
      }

      document.addEventListener('keyup', this.keyHandler);
      document.addEventListener(EVENT_MODAL_UPDATE, (e) => {
        if (e && e.detail && e.detail.id === this._id) {
          this._active = e.detail.status;
          this.updateView();
        }
      });
    }

    updateView () {
      if (this._active) {
        this._bodyoverflow = document.body.style.overflow;
        this._dom.style.opacity = 1;
        this._dom.style.visibility = 'visible';
        document.body.style.position = 'fixed';
        document.body.style.overflow = 'hidden';
      } else {
        this._dom.style.opacity = 0;
        this._dom.style.visibility = 'hidden';
        document.body.style.position = 'relative';
        document.body.style.overflow = this._bodyoverflow;
      }
    }

    dispatchStatusUpdate (status) {
      document.dispatchEvent(new CustomEvent(EVENT_MODAL_UPDATE, {
        detail: {
          id: this._id,
          status: status
        }
      }));
    }

    keyHandler (e) {
      switch (e.key) {
        case 'Escape':
          if (this._active) {
            this.deactivate();
          }
          break
      }
    }

    setupDom (target, content, id) {
      if (target) {
        if (content) {
          target.innerHTML = content;
        }
        return target
      } else {
        const okContent = content || '';
        const container = htmlToElement(`
        <aside>
          <div class="modal">
            <label class="modal__bg" for="${id}"></label>
            <div class="modal__inner">
                <label class="modal__close" for="${id}"></label>
                ${okContent}
            </div>
          </div>
        </aside>
      `);
        document.body.appendChild(container);
        return container
      }
    }

    get active () {
      return this._active
    }
  }

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

  /* global CustomEvent, Event */

  class Image {
    constructor (options) {
      const defaults = {
        dom: null,
        filename: null,
        active: true,
        url: null,
        caption: null,
        imageSelector: '.Image',
        lazyloadSelector: '.lazy',
        editable: false
      };
      const {
        url,
        filename,
        caption,
        dom,
        active,
        editable
      } = mergeSettings(options, defaults);

      // Binding functions to this
      this.dispatchStatusUpdate = this.dispatchStatusUpdate.bind(this);
      this.toggleStatus = this.toggleStatus.bind(this);
      this.applyStyle = this.applyStyle.bind(this);
      this.resetStatus = this.resetStatus.bind(this);
      this.updateCaption = this.updateCaption.bind(this);

      // Setting state
      this._id = uuidv4();
      this._dom = isDomNode(dom) ? dom : this.generateDom(url, filename, caption);
      if (!this._dom) {
        console.warn('%o is not a dom element. Can\'t get image dom.', dom);
      }
      this._src = url;
      this._caption = removeHtml(caption);
      this._filename = filename;
      this._captionSelector = this._dom && this._dom.querySelector('[contenteditable]');
      this._active = active;
      this._status = false;
      this._editable = editable;

      // Initializing style and initial listeners
      this.applyStyle();
      if (this._active) {
        this.activate(true);
      }
      if (this._editable && this._captionSelector) {
        this._captionSelector.addEventListener('input', this.updateCaption);
      }
    }

    activate (force) {
      if (force || !this._active) {
        this._active = true;
        this.initListeners();
      }
    }

    deactivate (force) {
      if (force || this._active) {
        this._active = false;
        this.removeListeners();
      }
    }

    initListeners () {
      if (this._dom) {
        this._dom.addEventListener('click', this.toggleStatus);
        this._dom.addEventListener(EVENT_STATUS_CHANGE, this.applyStyle);
      }
      document.addEventListener(EVENT_RESET, this.resetStatus);
    }

    removeListeners () {
      if (this._dom) {
        this._dom.removeEventListener('click', this.toggleStatus);
        this._dom.removeEventListener(EVENT_STATUS_CHANGE, this.applyStyle);
      }
      document.removeEventListener(EVENT_RESET, this.resetStatus);
    }

    resetStatus () {
      this._status = false;
      this.dispatchStatusUpdate();
    }

    toggleStatus () {
      this._status = !this._status;
      this.dispatchStatusUpdate();
    }

    updateCaption () {
      if (this._captionSelector) {
        this._caption = removeHtml(this._captionSelector.innerHTML);
      }
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
          <img class="lazy miniarch" src="./assets/css/loading.gif" data-src="${removeHtml(src)}" data-filename="${removeHtml(filename)}" title="${filename} preview" />
        </div>
        <div class="Image__caption"><span contenteditable="true">${removeHtml(caption)}</span></div>
        </div>`)
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
      this._filename = removeHtml(filename);
    }
    get filename () {
      return this._filename
    }

    set src (src) {
      this._src = removeHtml(src);
    }
    get src () {
      return this._src
    }
  }

  /* global Event */

  class Gallery {
    constructor (options) {
      const defaults = {
        gallerySelector: '.Gallery',
        imageSelector: '.Image',
        lazyloadSelector: '.lazy',
        active: true
      };
      const {
        gallerySelector,
        imageSelector,
        lazyloadSelector,
        active
      } = mergeSettings(options, defaults);

      this.keyHandler = this.keyHandler.bind(this);
      this.updateImage = this.updateImage.bind(this);
      this.getInitializedImages = this.getInitializedImages.bind(this);

      this._active = active;
      this._current = null;
      this._gallery = document.querySelector(gallerySelector);
      if (!this._gallery) {
        console.warn(`\nModule: Gallery.js\nWarning: No Gallery dom node found in document.\nCause: No gallerySelector provided.\nResult: Adding images may fail.`);
      }
      this._imageSelector = imageSelector;
      this._images = this.getInitializedImages(imageSelector, active);
      this._imagesBackup = this._images;
      this._lazyload = new LazyLoad({
        elements_selector: lazyloadSelector
      });

      if (active) {
        this.activate(true);
      } else {
        this.deactivate(true);
      }
    }

    activate (force) {
      if (force || !this._active) {
        this._active = true;
        this._gallery.classList.remove('Gallery--inactive');
        this._gallery.classList.add('Gallery--active');
        this.initListeners();
      }
    }

    deactivate (force) {
      if (force || this._active) {
        this._active = false;
        this._gallery.classList.remove('Gallery--active');
        this._gallery.classList.add('Gallery--inactive');
        this.removeListeners();
        this.deactivateImages();
      }
    }

    toggleActive () {
      this._active = !this._active;
    }

    getInitializedImages (selector, active) {
      const images = document.querySelectorAll(selector);
      const result = [];
      let i = -1;
      while (++i < images.length) {
        const image = this.getNewImage(images[i], active);
        if (image) {
          result.push(image);
        }
      }
      return result
    }

    initListeners () {
      document.addEventListener(EVENT_IMAGE_UPDATE, this.updateImage);
      document.addEventListener('keyup', this.keyHandler);
      this.activateImages();
    }

    removeListeners () {
      document.removeEventListener(EVENT_IMAGE_UPDATE, this.updateImage);
      document.removeEventListener('keyup', this.keyHandler);
      this.deactivateImages();
    }

    activateImages () {
      this._images.map(image => {
        image.activate();
      });
    }

    deactivateImages () {
      this._images.map(image => {
        image.deactivate();
      });
    }

    updateImage (e) {
      if (e.detail && e.detail.image && e.detail.image instanceof Image) {
        this.updateCurrentImage(e.detail.image);
      } else {
        this.updateCurrentImage(null);
      }
    }

    removeImageById (id) {
      let target = null;
      this._images = this._images.filter(image => {
        if (image.getId() === id) {
          target = image;
          return false
        }
        return true
      });
      if (target) {
        target.dom.classList.add('Image--markedfordeletion');
      }
      return this._images
    }

    revertRemoveImageById (id) {
      const match = this._imagesBackup.find(image => image.getId() === id);
      if (match) {
        match.dom.classList.remove('Image--markedfordeletion');
        this._images.push(match);
      }
      return this._images
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

    setImages (images) {
      if (!images || !images.length) {
        return
      }
      this._gallery.innerHTML = null;
      this.images = [];
      let i = -1;
      while (++i < images.length) {
        if ('src' in images[i] && 'filename' in images[i]) {
          this.addImage(this.getImageDom(images[i].src, images[i].filename));
        }
      }
    }

    addImage (dom) {
      const image = this.getNewImage(dom, this._active);
      if (dom && document.body.contains(dom)) {
        this._images.push(image);
      } else if (dom && !document.body.contains(dom)) {
        const images = document.querySelectorAll(this._imageSelector);
        if (images.length) {
          images[images.length - 1].parentNode.insertBefore(dom, images[images.length - 1].nextSibling);
        } else {
          this._gallery.appendChild(dom);
        }
        this._images.push(image);
      }
      this._imagesBackup = this._images;
      this._lazyload.update();
      return image
    }

    getNewImage (dom, active) {
      if (!dom || !isDomNode(dom)) {
        return null
      }
      const url = dom.querySelector('img') && dom.querySelector('img').src;
      const datafilename = dom.querySelector('img') && dom.querySelector('img').getAttribute('data-filename');
      const filename = datafilename ? basename(datafilename) : dom.querySelector('img') ? basename(dom.querySelector('img').src) : null;
      const caption = dom.querySelector('.Image__caption span') && dom.querySelector('.Image__caption span').innerHTML;

      return new Image(
        {
          url: url,
          filename: filename,
          caption: caption,
          dom: dom,
          active: active,
          editable: !active
        })
    }

    getImageDom (src, filename) {
      if (src) {
        return htmlToElement(`<div class="Image">
        <div class="Image__container">
          <img class="lazy miniarch" src="./assets/css/loading.gif" data-src="${src}" data-filename="${filename}" title="${filename} preview" />
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

  /* global Event, FormData, FileReader */

  /**
   * Provides editing capabilities
   * Acts as interface between UI and API
   */
  class Editor {
    /**
     * Binds functions to Editor, initializes options
     * @param  {Object}   options
     * @param  {string}   options.dropAreaSelector
     * @param  {string}   options.fileInputSelector
     * @param  {string}   options.progressBarSelector
     * @param  {string}   options.buttonPreviewSelector
     * @param  {string}   options.fullscreenDropZone
     * @param  {string}   options.bgColor
     * @param  {string}   options.textColor
     * @param  {string}   options.fontFamily
     * @param  {Gallery}  options.gallery
     * @param  {function} options.onUpdate
     */
    constructor (options) {
      const defaults = {
        dropAreaSelector: '#drop-area',
        fileInputSelector: '#file-input',
        progressBarSelector: '.progress-bar',
        buttonPreviewSelector: '.editbutton.preview',
        gallery: new Gallery({
          gallerySelector: '.Gallery',
          imageSelector: '.Image',
          lazyloadSelector: '.lazy',
          active: false
        }),
        fullscreenDropZone: true,
        bgColor: '#bbb',
        textColor: '#333',
        fontFamily: document.body.style.fontFamily,
        onUpdate: (newData, oldData) => {}
      };
      this.options = mergeSettings(options, defaults);
      this.actionSave = this.actionSave.bind(this);
      this.actionCancel = this.actionCancel.bind(this);
      this.actionUpdate = this.actionUpdate.bind(this);
      this.files = [];
      this.init(this.options);
    }

    /**
     * Initializer
     * @param  {Object} options
     */
    init (options) {
      const {
        bgColor,
        textColor,
        fontFamily,
        gallery,
        dropAreaSelector,
        fullscreenDropZone,
        fileInputSelector,
        progressBarSelector,
        onUpdate
      } = options;

      this._gallery = gallery;
      this._buttons = [];
      this._dropArea = document.querySelector(dropAreaSelector);
      this._fileInput = document.querySelector(fileInputSelector);
      this._fullscreenDropZone = Boolean(fullscreenDropZone);

      if (!this._gallery) {
        console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No Gallery provided.\nResult: Editor can't initialize.`);
        return
      }
      if (!this._dropArea) {
        console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No drop area with selector [${dropAreaSelector}] found in document.\nResult: Editor can't initialize.`);
        return
      }
      if (!this._fileInput) {
        console.warn(`\nModule: Editor.js\nWarning: Can't create file input listener.\nCause: No file input with selector [${fileInputSelector}] found in document.\nResult: Upload by file input button is disabled.`);
      }
      this._progressbar = new ProgressBar(progressBarSelector);

      this._menu = new Menu()

      ;(() => new Modal({
        target: '.modal',
        active: true,
        triggers: '.modal__bg, .modal__close'
      }))();

      this.onUpdate = onUpdate;
      this.bgColor = bgColor;
      this.textColor = textColor;
      this.fontFamily = fontFamily;
      this._backup = this.getState();
      this.initListeners();
    }

    /**
     * Ties a button to the Editor's menu object
     * @param {Object} options refer to Menu class
     */
    addButton (options) {
      const button = this.menu.addButton(options);
      if (button) {
        this._buttons.push(button);
      }
    }

    initListeners () {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        this._dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
      });

      if (this._fullscreenDropZone) {
  ['dragenter'].forEach(eventName => {
          document.addEventListener(eventName, (e) => {
            this._dropArea.classList.add('active');
          }, true);
        })
        ;['dragleave', 'drop'].forEach(eventName => {
          this._dropArea.addEventListener(eventName, (e) => {
            this._dropArea.classList.remove('active');
          }, true);
        });
      }
  ['dragenter', 'dragover'].forEach(eventName => {
        this._dropArea.addEventListener(eventName, () => {
          this.highlight();
        }, false);
      })

      ;['dragleave', 'drop'].forEach(eventName => {
        this._dropArea.addEventListener(eventName, () => {
          this.unhighlight();
        }, false);
      });

      // Handle dropped files
      this._dropArea.addEventListener('drop', (e) => {
        this.handleDrop(e);
      }, false);

      if (this._fileInput) {
        this._fileInput.addEventListener('change', (e) => {
          if (e.target && e.target.files) {
            this.handleFiles(e.target.files);
          }
        });
      }

      // Adding controls to images
      this._gallery.images.map(image => this.addControlsToImage(image));
    }

    /**
     * Given an image object, attaches menu buttons
     * @param {Image} image
     */
    addControlsToImage (image) {
      const deleteButton = this.getImageButton('╳', 'button--delete', image.getId());
      const revertButton = this.getImageButton('⏪', 'button--revert', image.getId());
      const imageControls = htmlToElement('<div class="Image__controls"></div>');

      imageControls.appendChild(deleteButton);
      imageControls.appendChild(revertButton);
      image.dom.appendChild(imageControls);
      this.menu.addButton({
        type: 'toggle',
        domNode: deleteButton,
        domNode2: revertButton,
        callback: this.editDeleteImage.bind(this),
        callback2: this.editRevertImage.bind(this)
      });
    }

    set bgColor (color) {
      if (isHexColor(color)) {
        this._bgColor = color;
        document.body.style.backgroundColor = color;
      }
    }

    get bgColor () {
      return this._bgColor
    }

    set textColor (color) {
      if (isHexColor(color)) {
        this._textColor = color;
        document.body.style.color = color;
      }
    }

    get textColor () {
      return this._textColor
    }

    set fontFamily (fontfamily) {
      this._fontFamily = fontfamily;
      document.body.style.fontFamily = fontfamily;
    }

    get fontFamily () {
      return this._fontFamily
    }

    get buttons () {
      return this._buttons
    }

    get gallery () {
      return this._gallery
    }

    get menu () {
      return this._menu
    }

    /**
     * Saves the current state if different than the previous state
     * @param  {string} csrfToken required token for api
     */
    actionSave (csrfToken) {
      const state = this.getState();
      if (!areObjectsEqual(state, this._backup)) {
        this.saveData(state, csrfToken);
      }
    }

    /**
     * Saves the previous state if different than the current state
     * @param  {string} csrfToken required token for api
     */
    actionCancel (csrfToken) {
      if (!areObjectsEqual(this.getState(), this._backup)) {
        this.saveData(this._backup, csrfToken);
      }
    }

    /**
     * Marks an image for deletion
     * @param  {event} e click event
     */
    editDeleteImage (e) {
      if (e) {
        const id = e.target.getAttribute('data-id') || e.target.parentNode.getAttribute('data-id');
        if (id) {
          this._gallery.removeImageById(id);
        }
      }
    }

    /**
     * Recovers an image
     * @param  {event} e click event
     */
    editRevertImage (e) {
      if (e) {
        const id = e.target.getAttribute('data-id') || e.target.parentNode.getAttribute('data-id');
        if (id) {
          this._gallery.revertRemoveImageById(id);
        }
      }
    }

    /**
     * Saves data, dispatching a loading event, setting the new state
     * @param  {object} data      [description]
     * @param  {string} csrfToken required csrfToken
     */
    saveData (data, csrfToken) {
      document.dispatchEvent(new Event(EVENT_LOADING));
      this.uploadData(data, csrfToken)
        .then((res) => {
          this.actionUpdate(res.data);
          this.onUpdate(res.data, this._backup);
          this._backup = this.getState();
        })
        .catch(err => console.log(err))
        .finally(() => document.dispatchEvent(new Event(EVENT_LOADED)));
    }

    /**
     * Updates the view
     * @param  {object} data
     */
    actionUpdate (data) {
      const {
        images,
        title,
        note,
        bgcolor,
        textcolor,
        fontfamily
      } = data;

      if (images) {
        this._gallery.setImages(images);
        this._gallery.images.map(image => this.addControlsToImage(image));
      }
      if (title) {
        document.querySelector(SELECTOR_TITLE).innerHTML = title;
      }
      if (note) {
        const html = htmlToElement('<div>' + note + '</div>');
        document.querySelector(SELECTOR_NOTE).innerHTML = '';
        document.querySelector(SELECTOR_NOTE).appendChild(html);
      }
      if (bgcolor && isHexColor(bgcolor)) {
        this.bgColor = bgcolor;
        document.body.style.backgroundColor = this.bgColor;
      }
      if (textcolor && isHexColor(textcolor)) {
        this.textColor = textcolor;
        document.body.style.color = this.textColor;
      }
      if (fontfamily) {
        this.fontFamily = fontfamily;
        document.body.style.fontFamily = this.fontFamily;
      }
    }

    /**
     * Returns the current state
     * @return {object}
     */
    getState () {
      const result = {
        title: '',
        note: '',
        images: []
      };
      const title = document.querySelector(SELECTOR_TITLE);
      const note = document.querySelector(SELECTOR_NOTE);
      const bgColor = this.bgColor;
      const textColor = this.textColor;
      const fontFamily = this.fontFamily;
      const images = this._gallery.images;

      if (title) {
        result.title = removeHtml(title.innerHTML);
      }
      if (note) {
        result.note = processContentEditable(note.innerHTML);
      }
      if (bgColor && isHexColor(bgColor)) {
        result.bgcolor = bgColor;
      }
      if (textColor && isHexColor(textColor)) {
        result.textcolor = textColor;
      }
      if (fontFamily) {
        result.fontfamily = fontFamily;
      }
      if (images && images.length) {
        result.images = [...images].map((image) => {
          return {
            id: image.getId(),
            filename: image.filename,
            newfilename: removeHtml(image.caption)
          }
        });
      }
      return result
    }

    /**
     * Calls the api with the new data to be saved
     * @param  {object} data      [description]
     * @param  {string} csrfToken [description]
     * @return {Promise}           [description]
     */
    uploadData (data, csrfToken) {
      const api = new Fetch();
      const formData = new FormData();
      const url = API_URL;

      formData.append('data', JSON.stringify(data));
      formData.append('action', API_SAVE);
      formData.append('csrf_token', csrfToken);

      return new Promise((resolve, reject) => {
        api.newRequest(url, formData)
          .then(data => resolve(data))
          .catch(err => reject(err));
      })
    }

    /**
     * Calls the api with a file data to be uploaded
     * @param  {File} file        [description]
     * @param  {string} csrfToken [description]
     * @return {Promise}          [description]
     */
    uploadFile (file, csrfToken) {
      const api = new Fetch();
      const url = API_URL;
      const formData = new FormData();

      formData.append('file', file);
      formData.append('action', API_UPLOAD);
      formData.append('csrf_token', csrfToken);

      return new Promise((resolve, reject) => {
        api.newRequest(url, formData)
          .then(data => resolve(data))
          .catch(err => reject(err));
      })
    }

    /**
     * Adds a new image to Editor's gallery, and adds controls
     * @param  {File} file     [description]
     * @param  {string} filename [description]
     */
    previewFile (file, filename) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        const image = this._gallery.addImage(this.getPreviewDom(reader.result, filename));

        if (image) {
          this.addControlsToImage(image);
        }
      };
    }

    /**
     * Returns an image domNode
     * @param  {string} src      [description]
     * @param  {string} filename [description]
     * @return {domNode}          [description]
     */
    getPreviewDom (src, filename) {
      if (src) {
        return htmlToElement(`<div class="Image">
        <div class="Image__container">
          <img class="lazy miniarch" src="./assets/css/loading.gif" data-src="${src}" data-filename="${filename}" title="${filename} preview" />
        </div>
        <div class="Image__caption"><span contenteditable="true">${stripExtension(filename)}</span></div>
        </div>`)
      }
    }

    /**
     * Handles drop zone event, calling the file handler
     * @param  {event} e drop event
     */
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

    /**
     * Uploads a series of files
     * @param  {array} files [description]
     */
    handleFiles (files) {
      files = [...files];
      this._progressbar.initializeProgress(files.length);
      files.forEach(file => {
        this.uploadFile(file, this.getCsrfToken(this._dropArea))
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

    /**
     * Returns a preformatted button domNode
     * @param  {domNode|string} content     [description]
     * @param  {string} buttonClass [description]
     * @param  {string|number} id          [description]
     * @return {domNode}             [description]
     */
    getImageButton (content, buttonClass, id) {
      const dom = htmlToElement(`<div class="pure-button ${buttonClass}" data-id="${id}"><span>${content}</span></div>`);
      return dom
    }

    /**
     * Gets a csrf_token in dom
     * @param  {domNode} domNode target to where to look for the token
     * @return {string}         [description]
     */
    getCsrfToken (domNode) {
      if (domNode && isDomNode(domNode)) {
        const inputElement = domNode.querySelector('[name=csrf_token]');
        return inputElement && inputElement.value
      }
      return ''
    }

    /**
     * Adds the highlight class to drop area
     */
    highlight () {
      this._dropArea.classList.add('highlight');
    }

    /**
     * Removes the highlight class to drop area
     */
    unhighlight () {
      this._dropArea.classList.remove('highlight');
    }
  }

  class Loader {
    constructor (options) {
      this.config = mergeSettings(options, { loaderClass: 'Loader' });
      this.init();
    }

    init () {
      const {
        loaderClass
      } = this.config;
      const content = document.createElement('div');

      content.classList.add('content');
      content.innerHTML = 'Loading...';

      this.dom = document.createElement('aside');
      this.dom.classList.add(loaderClass);
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

  const getCsrfToken = (domNode) => {
    if (domNode && isDomNode(domNode)) {
      const inputElement = domNode.querySelector('[name=csrf_token]');
      return inputElement && inputElement.value
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const bgColorBtnSelector = document.querySelector('#bg_color');
    const textColorBtnSelector = document.querySelector('#text_color');
    const fontfamilyBtnSelector = document.querySelector('#font_family');
    const saveBtnSelector = document.querySelector('.editbutton.save');
    const cancelBtnSelector = document.querySelector('.editbutton.cancel');
    const previewBtnSelector = document.querySelector('.editbutton.preview')

    ;(() => new Loader())();
    const editor = new Editor({
      bgColor: bgColorBtnSelector.value,
      textColor: textColorBtnSelector.value,
      onUpdate: (newState, oldState) => {
        bgColorBtnSelector.value = newState.bgcolor;
        bgColorBtnSelector.nextSibling.innerHTML = newState.bgcolor;
        textColorBtnSelector.value = newState.textcolor;
        textColorBtnSelector.nextSibling.innerHTML = newState.textcolor;
      }
    });

    // Save button
    editor.addButton({
      domNode: saveBtnSelector,
      callback: () => {
        editor.actionSave(getCsrfToken(saveBtnSelector));
      },
      csrf_token: getCsrfToken(saveBtnSelector)
    });

    // Cancel button
    editor.addButton({
      domNode: cancelBtnSelector,
      callback: () => {
        editor.actionCancel(getCsrfToken(cancelBtnSelector));
      },
      csrf_token: getCsrfToken(cancelBtnSelector)
    });

    // Preview button
    editor.addButton({
      domNode: previewBtnSelector,
      callback: () => { window.location = baseUrl(); },
      csrf_token: getCsrfToken(previewBtnSelector)
    });

    // Background color selector
    editor.addButton({
      domNode: bgColorBtnSelector,
      type: 'input',
      callback: (e) => {
        editor.bgColor = e.target.value;
        e.target.nextSibling.innerHTML = editor.bgColor;
      }
    });

    // Text color selector
    editor.addButton({
      domNode: textColorBtnSelector,
      type: 'input',
      callback: (e) => {
        editor.textColor = e.target.value;
        e.target.nextSibling.innerHTML = editor.textColor;
      }
    });

    // Font family selector
    editor.addButton({
      domNode: fontfamilyBtnSelector,
      type: 'input',
      callback: (e) => {
        editor.fontFamily = e.target.value;
      }
    });
  });

}());
