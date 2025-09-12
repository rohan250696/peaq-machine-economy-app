// CRITICAL: Load polyfills FIRST before any other imports
console.log('=== INDEX.JS START ===');

// Load basic polyfills first
require('./polyfills-basic.js');

console.log('Buffer after basic polyfills:', typeof global.Buffer);
console.log('Process before polyfills:', typeof global.process);
console.log('Crypto before polyfills:', typeof global.crypto);

// Add global error handlers
global.onerror = function(message, source, lineno, colno, error) {
  console.error('GLOBAL ERROR:', {
    message,
    source,
    lineno,
    colno,
    error: error?.stack || error?.message
  });
  return false;
};

global.onunhandledrejection = function(event) {
  console.error('UNHANDLED PROMISE REJECTION:', event.reason);
};

// Comprehensive polyfills for React Native with Hermes
try {
  // Buffer polyfill - Force load regardless of current state
  console.log('Loading Buffer polyfill...');
  const { Buffer } = require('@craftzdog/react-native-buffer');
  
  // Set Buffer everywhere possible
  global.Buffer = Buffer;
  globalThis.Buffer = Buffer;
  if (typeof window !== 'undefined') window.Buffer = Buffer;
  if (typeof process !== 'undefined') process.Buffer = Buffer;
  
  // Also set it on module.exports for Node.js compatibility
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.Buffer = Buffer;
  }
  
  console.log('Buffer polyfill loaded successfully!');
  console.log('Buffer type:', typeof Buffer);
  console.log('global.Buffer type:', typeof global.Buffer);
  console.log('globalThis.Buffer type:', typeof globalThis.Buffer);

  // Process polyfill
  if (typeof global.process === 'undefined') {
    const process = require('process');
    global.process = process;
    globalThis.process = process;
    console.log('Process polyfill loaded successfully!');
  }

  // Crypto polyfill
  if (typeof global.crypto === 'undefined') {
    require('react-native-get-random-values');
    console.log('Crypto polyfill loaded successfully!');
  }

  // Text encoding polyfills
  require('fast-text-encoding');
  require('react-native-url-polyfill/auto');
  console.log('Text encoding polyfills loaded successfully!');

  // Safe slice polyfills for Hermes
  if (typeof String.prototype.slice !== 'function') {
    String.prototype.slice = function(start, end) {
      if (this == null) throw new TypeError('String.prototype.slice called on null or undefined');
      const str = String(this);
      const len = str.length;
      const intStart = start == null ? 0 : Number(start);
      const intEnd = end == null ? len : Number(end);
      const from = intStart < 0 ? Math.max(len + intStart, 0) : Math.min(intStart, len);
      const to = intEnd < 0 ? Math.max(len + intEnd, 0) : Math.min(intEnd, len);
      if (from >= to) return '';
      return str.substring(from, to);
    };
    console.log('String slice polyfill loaded successfully!');
  }

  if (typeof Array.prototype.slice !== 'function') {
    Array.prototype.slice = function(start, end) {
      if (this == null) throw new TypeError('Array.prototype.slice called on null or undefined');
      const arr = Object(this);
      const len = arr.length >>> 0;
      const intStart = start == null ? 0 : Number(start);
      const intEnd = end == null ? len : Number(end);
      const from = intStart < 0 ? Math.max(len + intStart, 0) : Math.min(intStart, len);
      const to = intEnd < 0 ? Math.max(len + intEnd, 0) : Math.min(intEnd, len);
      const result = [];
      for (let i = from; i < to; i++) {
        if (i in arr) result.push(arr[i]);
      }
      return result;
    };
    console.log('Array slice polyfill loaded successfully!');
  }

  console.log('All polyfills loaded successfully!');
  
  // Test Buffer functionality
  try {
    const testBuffer = Buffer.from('test', 'utf8');
    console.log('Buffer test successful:', testBuffer.toString());
  } catch (bufferError) {
    console.error('Buffer test failed:', bufferError);
  }
  
} catch (error) {
  console.error('Failed to load polyfills:', error);
  
  // Fallback Buffer polyfill
  try {
    console.log('Attempting fallback Buffer polyfill...');
    const { Buffer: FallbackBuffer } = require('buffer');
    global.Buffer = FallbackBuffer;
    globalThis.Buffer = FallbackBuffer;
    if (typeof window !== 'undefined') window.Buffer = FallbackBuffer;
    console.log('Fallback Buffer polyfill loaded successfully!');
  } catch (fallbackError) {
    console.error('Fallback Buffer polyfill also failed:', fallbackError);
  }
}

// Import the main app
import { registerRootComponent } from 'expo'
import App from './App'

// Register the main component
registerRootComponent(App)