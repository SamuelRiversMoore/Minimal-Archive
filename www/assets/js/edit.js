(function () {
  'use strict';

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

  const isDomNode = (element) => {
    return element instanceof Element || element instanceof HTMLDocument
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

  const mergeSettings = (options) => {
    const settings = {
      dropAreaSelector: '#drop-area',
      fileInputSelector: '#file-input',
      progressBarSelector: '.progress-bar',
      gallery: null,
      fullscreenDropZone: true
    };

    for (const attrName in options) {
      settings[attrName] = options[attrName];
    }

    return settings
  };

  class Editor {
    constructor (options) {
      this.config = mergeSettings(options);
      this.uploadFile = this.uploadFile.bind(this);
      this.previewFile = this.previewFile.bind(this);

      this.init();
    }

    init () {
      const {
        gallery,
        dropAreaSelector,
        fullscreenDropZone,
        fileInputSelector,
        progressBarSelector
      } = this.config;

      this.gallery = gallery;
      this.dropArea = document.querySelector(dropAreaSelector);
      this.fileInput = document.querySelector(fileInputSelector);
      this.fullscreenDropZone = Boolean(fullscreenDropZone);

      if (!this.gallery) {
        console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No Gallery provided.\nResult: Editor can't initialize.`);
        return
      }
      if (!this.dropArea) {
        console.warn(`\nModule: Editor.js\nError: Can't create editor.\nCause: No drop area with selector [${dropAreaSelector}] found in document.\nResult: Editor can't initialize.`);
        return
      }
      if (!this.fileInput) {
        console.warn(`\nModule: Editor.js\nWarning: Can't create file input listener.\nCause: No file input with selector [${fileInputSelector}] found in document.\nResult: Upload by file input button is disabled.`);
      }
      this.progressbar = new ProgressBar(progressBarSelector);
      this.initListeners();
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
    }

    uploadFile (file, i) {
      // const url = '/edit?upload_file'
      // var xhr = new XMLHttpRequest()
      // var formData = new FormData()
      // xhr.open('POST', url, true)
      // xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

      // // Update progress (can be used to show progress indicator)
      // xhr.upload.addEventListener('progress', (e) => {
      //   this.progressbar.updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
      // })

      // xhr.addEventListener('readystatechange', (e) => {
      //   if (xhr.readyState === 4 && xhr.status === 200) {
      //     this.progressbar.updateProgress(i, 100)
      //   } else if (xhr.readyState === 4 && xhr.status !== 200) {
      //     console.log(xhr)
      //   }
      // })

      // formData.append('file', file)
      // xhr.send(formData)
    }

    previewFile (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        this.gallery.addImage(this.getPreviewDom(reader.result));
      };
    }

    getPreviewDom (src) {
      return htmlToElement(`<div class="Image">
      <div class="Image__container">
        <img class="lazy miniarch" src="/assets/css/loading.gif" data-src="${src}" title="new image preview" />
      </div>
      <div class="Image__caption"><span contenteditable="true">new_image</span></div>
      </div>`)
    }

    handleFiles (files) {
      files = [...files];
      this.progressbar.initializeProgress(files.length);
      files.forEach(this.uploadFile);
      files.forEach(this.previewFile);
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
      this.handleFiles(imageFiles);
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

  class Image {
    constructor (image) {
      if (!isDomNode(image)) {
        console.error('%o is not a dom element!', image);
      }
      this.dom = image;
      this.stat = false;
      this.initListeners();
      this.dispatchStatusUpdate = this.dispatchStatusUpdate.bind(this);
    }

    initListeners () {
      this.dom.addEventListener('click', this.toggleStatus.bind(this));
      this.dom.addEventListener('status-change', this.applyStyle.bind(this));
      document.addEventListener('reset', (e) => {
        this.stat = false;
        this.dispatchStatusUpdate();
      });
    }

    toggleStatus (event) {
      this.stat = !this.stat;
      this.dispatchStatusUpdate();
    }

    dispatchStatusUpdate (event) {
      this.dom.dispatchEvent(new Event('status-change'));
      document.dispatchEvent(new CustomEvent('image-update', {
        detail: {
          image: this.stat ? this : null
        }
      }));
    }

    applyStyle (event) {
      if (this.stat) {
        this.dom.classList.add('Image--active');
      } else {
        this.dom.classList.remove('Image--active');
      }
    }

    set image (image) {
      this.dom = image;
    }

    get image () {
      return this.dom
    }

    set status (status) {
      this.stat = status;
      this.dom.dispatchEvent(new Event('status-change'));
    }

    get status () {
      return this.stat
    }
  }

  const mergeSettings$1 = (options) => {
    const settings = {
      image_selector: '.Image',
      lazyload_selector: '.lazy'
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
      const images = document.querySelectorAll(this.config.image_selector);

      this.currentImage = null;

      let i = -1;
      this.imgs = [];
      while (++i < images.length) {
        this.imgs.push(new Image(images[i]));
      }

      this.lazyload = new LazyLoad({
        elements_selector: this.config.lazyload_selector
      });

      this.initListeners();
    }

    initListeners () {
      document.addEventListener('image-update', (e) => {
        if (e.detail && e.detail.image && e.detail.image instanceof Image) {
          this.updateCurrentImage(e.detail.image);
        } else {
          this.updateCurrentImage(null);
        }
      });

      document.addEventListener('keyup', this.keyHandler.bind(this));
    }

    updateCurrentImage (image) {
      if (this.currentImage instanceof Image) {
        this.currentImage.status = false;
      }
      this.currentImage = image;
      if (this.currentImage instanceof Image) {
        this.currentImage.status = true;
        scrollTo(this.currentImage.dom);
      } else {
        scrollTo(0);
      }
    }

    keyHandler (e) {
      switch (e.key) {
        case 'ArrowLeft':
          if (this.currentImage) {
            e.preventDefault();
            this.prev();
          }
          break
        case 'ArrowRight':
          if (this.currentImage) {
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
        this.imgs.push(new Image(dom));
      } else if (dom && !document.body.contains(dom)) {
        const images = document.querySelectorAll(this.config.image_selector);
        images[images.length - 1].parentNode.insertBefore(dom, images[images.length - 1].nextSibling);
        this.imgs.push(new Image(dom));
      }
      this.lazyload.update();
    }

    get current () {
      return this.currentImage
    }

    set current (image) {
      this.updateCurrentImage(image);
    }

    get images () {
      return this.imgs
    }

    set images (images) {
      this.imgs = images;
    }

    next () {
      const index = this.images.indexOf(this.currentImage);
      if (index >= 0 && index <= this.images.length - 2) {
        this.updateCurrentImage(this.images[index + 1]);
      } else if (index > this.images.length - 2) {
        this.updateCurrentImage(this.images[0]);
      }
    }

    prev () {
      const index = this.images.indexOf(this.currentImage);
      if (index > 0) {
        this.updateCurrentImage(this.images[index - 1]);
      } else if (index === 0) {
        this.updateCurrentImage(this.images[this.images.length - 1]);
      }
    }

    reset () {
      document.dispatchEvent(new Event('reset'));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const gallery = new Gallery({
      image_selector: '.Image',
      lazyload_selector: '.lazy'
    })

    ;(() => new Editor({
      gallery: gallery
    }))();

    gallery.reset();
  });

}());
