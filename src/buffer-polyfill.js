// Comprehensive Buffer polyfill for React Native
import { Buffer } from '@craftzdog/react-native-buffer'

// Set Buffer globally
global.Buffer = Buffer

// Also set it on the globalThis object for modern environments
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer
}

// Set it on the window object for web compatibility
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
}

// Set it on the process object if it exists
if (typeof process !== 'undefined') {
  process.Buffer = Buffer
}

// Export for module resolution
export default Buffer
export { Buffer }
