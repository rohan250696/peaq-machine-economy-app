// Comprehensive Buffer polyfill for React Native
// This ensures Buffer is available in all contexts and scenarios

import { Buffer } from '@craftzdog/react-native-buffer'

// Function to set Buffer on any object
const setBufferOnObject = (obj) => {
  if (obj && typeof obj === 'object') {
    obj.Buffer = Buffer
    // Also set it as a non-enumerable property to avoid conflicts
    try {
      Object.defineProperty(obj, 'Buffer', {
        value: Buffer,
        writable: true,
        enumerable: false,
        configurable: true
      })
    } catch (e) {
      // Fallback if defineProperty fails
      obj.Buffer = Buffer
    }
  }
}

// Set Buffer on all possible global objects
const globalObjects = [
  typeof global !== 'undefined' ? global : null,
  typeof globalThis !== 'undefined' ? globalThis : null,
  typeof window !== 'undefined' ? window : null,
  typeof self !== 'undefined' ? self : null,
  typeof process !== 'undefined' ? process : null,
  typeof module !== 'undefined' && module.exports ? module.exports : null,
  typeof exports !== 'undefined' ? exports : null
].filter(Boolean)

globalObjects.forEach(setBufferOnObject)

// Also set it on the current context
if (typeof this !== 'undefined') {
  setBufferOnObject(this)
}

// Create a fallback Buffer if it's still not available
if (typeof Buffer === 'undefined') {
  console.warn('Buffer polyfill failed, creating fallback')
  const fallbackBuffer = class Buffer extends Uint8Array {
    constructor(...args) {
      super(...args)
    }
    static from(data, encoding) {
      if (typeof data === 'string') {
        return new Uint8Array(new TextEncoder().encode(data))
      }
      return new Uint8Array(data)
    }
    static alloc(size, fill) {
      const buffer = new Uint8Array(size)
      if (fill !== undefined) {
        buffer.fill(fill)
      }
      return buffer
    }
    toString(encoding) {
      return new TextDecoder().decode(this)
    }
  }
  
  globalObjects.forEach(obj => {
    if (obj) obj.Buffer = fallbackBuffer
  })
}

// Export for module resolution
export default Buffer
export { Buffer }
