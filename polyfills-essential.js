// Essential polyfills for React Native - JavaScript file for better compatibility
console.log('=== POLYFILLS LOADING START ===');
console.log('Loading essential polyfills...');

// Add a simple alert to test if this file is being executed
if (typeof global !== 'undefined' && global.alert) {
  global.alert('Polyfills are loading!');
}

// Set up global references first
if (typeof global === 'undefined') {
  global = {};
}
if (typeof globalThis === 'undefined') {
  globalThis = global;
}
if (typeof window === 'undefined') {
  window = global;
}

// CRITICAL: Load Buffer FIRST using the standard buffer package (not @craftzdog)
// This is the exact solution for react-native-quick-crypto compatibility
let BufferLoaded = false;
try {
  const { Buffer } = require('buffer');
  console.log('Buffer loaded from buffer package:', typeof Buffer);
  
  // Set Buffer on multiple global objects IMMEDIATELY
  global.Buffer = Buffer;
  globalThis.Buffer = Buffer;
  window.Buffer = Buffer;
  
  // Also set it on process for Node.js compatibility
  if (global.process) {
    global.process.Buffer = Buffer;
  }
  
  BufferLoaded = true;
} catch (error) {
  console.error('Failed to load Buffer:', error);
}

// Load process polyfill
try {
  const processPolyfill = require('process');
  console.log('Process loaded successfully:', typeof processPolyfill);
  global.process = processPolyfill;
  globalThis.process = processPolyfill;
  window.process = processPolyfill;
  
  // Set Buffer on process if available
  if (BufferLoaded && global.Buffer) {
    global.process.Buffer = global.Buffer;
  }
} catch (error) {
  console.error('Failed to load Process:', error);
}

// Load basic crypto polyfill (NOT react-native-quick-crypto yet)
try {
  require('react-native-get-random-values');
  console.log('Basic crypto polyfill loaded');
} catch (error) {
  console.log('Basic crypto polyfill not available:', error.message);
}

// Load other essential polyfills
try {
  require('fast-text-encoding');
  console.log('Text encoding polyfill loaded');
} catch (error) {
  console.log('Text encoding polyfill not available:', error.message);
}

try {
  require('react-native-url-polyfill/auto');
  console.log('URL polyfill loaded');
} catch (error) {
  console.log('URL polyfill not available:', error.message);
}

// DO NOT load react-native-quick-crypto here - it has compatibility issues with Hermes
// Instead, we'll use the fallback crypto polyfill
console.log('Skipping react-native-quick-crypto due to Hermes compatibility issues');

// Additional global setup
global.globalThis = global;
global.window = global;

// Ensure Buffer is available everywhere
if (BufferLoaded && global.Buffer) {
  // Set Buffer on module.exports for CommonJS compatibility
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.Buffer = global.Buffer;
  }
  
  // Set Buffer on require for dynamic requires
  if (typeof require !== 'undefined') {
    require.Buffer = global.Buffer;
  }
}

console.log('Polyfills setup complete. Global Buffer:', typeof global.Buffer, 'BufferLoaded:', BufferLoaded);
console.log('Buffer available on globalThis:', typeof globalThis.Buffer);
console.log('Buffer available on window:', typeof window.Buffer);
console.log('=== POLYFILLS LOADING END ===');

// Add global error handler to catch Buffer-related errors
const originalOnError = global.onerror;
global.onerror = function(message, source, lineno, colno, error) {
  if (typeof message === 'string' && message.includes('Buffer')) {
    console.error('BUFFER ERROR CAUGHT:', {
      message,
      source,
      lineno,
      colno,
      error: error?.stack || error?.message,
      globalBuffer: typeof global.Buffer,
      globalThisBuffer: typeof globalThis.Buffer,
      windowBuffer: typeof window.Buffer
    });
  }
  if (originalOnError) {
    return originalOnError.call(this, message, source, lineno, colno, error);
  }
  return false;
};

// Test Buffer functionality
try {
  if (global.Buffer) {
    const testBuffer = global.Buffer.from('test');
    console.log('Buffer test successful:', testBuffer.toString());
  } else {
    console.error('Buffer is not available on global object');
  }
} catch (error) {
  console.error('Buffer test failed:', error);
}
