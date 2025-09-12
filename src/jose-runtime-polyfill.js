// Comprehensive polyfill for jose package Node.js ESM runtime modules
import './global-polyfills'
import crypto from 'crypto-browserify'

// Create a comprehensive polyfill object that handles all jose runtime needs
const joseRuntimePolyfill = {
  // Crypto polyfill
  crypto: crypto,
  
  // Zlib polyfill
  zlib: {
    deflateRaw: (data) => Buffer.from(data),
    inflateRaw: (data) => Buffer.from(data),
    gzip: (data) => Buffer.from(data),
    gunzip: (data) => Buffer.from(data),
    deflate: (data) => Buffer.from(data),
    inflate: (data) => Buffer.from(data),
  },
  
  // Stream polyfill
  stream: {
    Readable: class Readable {
      constructor() {}
    },
    Writable: class Writable {
      constructor() {}
    },
    Transform: class Transform {
      constructor() {}
    },
  },
  
  // Buffer polyfill
  Buffer: Buffer,
  
  // Process polyfill
  process: {
    env: {},
    nextTick: (callback) => setTimeout(callback, 0),
    browser: true,
  },
  
  // Util polyfill
  util: {
    inspect: (obj) => JSON.stringify(obj),
    promisify: (fn) => fn,
  },
  
  // Assert polyfill
  assert: {
    equal: (a, b) => a === b,
    notEqual: (a, b) => a !== b,
    strictEqual: (a, b) => a === b,
    notStrictEqual: (a, b) => a !== b,
  },
}

// Make all polyfills available globally
Object.assign(global, joseRuntimePolyfill)

// Export for module resolution
export default joseRuntimePolyfill
export { crypto, joseRuntimePolyfill }
