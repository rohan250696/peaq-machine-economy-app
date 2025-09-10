// Comprehensive polyfills for React Native
import 'react-native-get-random-values'
import 'react-native-url-polyfill/auto'

// Crypto polyfills
import { Buffer } from '@craftzdog/react-native-buffer'
global.Buffer = Buffer

// Text encoding polyfills
import 'fast-text-encoding'

// Additional Node.js polyfills
if (typeof global.process === 'undefined') {
  global.process = require('process')
}

if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => {
    return setTimeout(callback, 0, ...args)
  }
}

if (typeof global.clearImmediate === 'undefined') {
  global.clearImmediate = (id) => {
    clearTimeout(id)
  }
}

// Fix for atob/btoa if needed
if (typeof global.atob === 'undefined') {
  global.atob = (str) => {
    try {
      return atob(str)
    } catch (e) {
      return atob(str + '=')
    }
  }
}

if (typeof global.btoa === 'undefined') {
  global.btoa = (str) => {
    return btoa(str)
  }
}

// Console polyfill for better debugging
if (typeof global.console === 'undefined') {
  global.console = console
}
