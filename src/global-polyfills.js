
// Global polyfills that must be loaded before ANY other code
// This file ensures all Node.js globals are available immediately

// Buffer polyfill - CRITICAL: Must be first
import { Buffer } from '@craftzdog/react-native-buffer'

// Set Buffer on ALL possible global objects immediately
if (typeof global !== 'undefined') {
  global.Buffer = Buffer
}
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer
}
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
}
if (typeof process !== 'undefined') {
  process.Buffer = Buffer
}

// Also set it on the module.exports for CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports.Buffer = Buffer
}

// Process polyfill
if (typeof global.process === 'undefined') {
  global.process = {
    env: {},
    nextTick: (callback) => setTimeout(callback, 0),
    browser: true,
    version: 'v16.0.0',
    versions: {},
    platform: 'react-native',
    arch: 'arm64',
    cwd: () => '/',
    chdir: () => {},
    umask: () => 0,
    hrtime: () => [0, 0],
    uptime: () => 0,
    memoryUsage: () => ({}),
    kill: () => {},
    exit: () => {},
    on: () => {},
    off: () => {},
    emit: () => {},
    addListener: () => {},
    removeListener: () => {},
    removeAllListeners: () => {},
    setMaxListeners: () => {},
    getMaxListeners: () => 10,
    listeners: () => [],
    rawListeners: () => [],
    eventNames: () => [],
    listenerCount: () => 0,
    prependListener: () => {},
    prependOnceListener: () => {},
    once: () => {},
  }
}

// Console polyfill
if (typeof global.console === 'undefined') {
  global.console = console
}

// SetImmediate polyfill
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

// TextEncoder/TextDecoder polyfill
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(input) {
      return new Uint8Array(Buffer.from(input, 'utf8'))
    }
  }
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(input) {
      return Buffer.from(input).toString('utf8')
    }
  }
}

// Export Buffer for module resolution
export default Buffer
export { Buffer }
