// Custom polyfill for jose package to avoid Node.js ESM runtime issues
import { Buffer } from '@craftzdog/react-native-buffer'
import crypto from 'crypto-browserify'

// Polyfill zlib for jose package
const zlib = {
  deflateRaw: (data) => {
    // Simple implementation - in production you might want to use a proper zlib implementation
    return Buffer.from(data)
  },
  inflateRaw: (data) => {
    // Simple implementation - in production you might want to use a proper zlib implementation
    return Buffer.from(data)
  },
  gzip: (data) => {
    return Buffer.from(data)
  },
  gunzip: (data) => {
    return Buffer.from(data)
  }
}

// Make zlib and crypto available globally
global.zlib = zlib
global.crypto = crypto

// Export for module resolution
export default zlib
export { crypto }
