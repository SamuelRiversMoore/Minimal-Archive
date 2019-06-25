import {
  baseUrl
} from './Helpers.js'

export const API_URL = baseUrl() + '/api'
export const API_UPLOAD = 'upload'
export const API_SAVE = 'save'

export const SELECTOR_TITLE = 'main header .title'
export const SELECTOR_NOTE = '.note'
export const SELECTOR_IMAGE = '.Image__container img'

export const EVENT_IMAGE_UPDATE = 'image-update'
export const EVENT_LOADED = 'loaded'
export const EVENT_LOADING = 'loading'
export const EVENT_MODAL_UPDATE = 'modal-update'
export const EVENT_STATUS_CHANGE = 'status-change'
export const EVENT_RESET = 'reset'
