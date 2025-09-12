// Ultra-basic polyfills - just Buffer
console.log('=== POLYFILLS-BASIC.JS START ===');

// Force Buffer polyfill
try {
  const { Buffer } = require('@craftzdog/react-native-buffer');
  global.Buffer = Buffer;
  globalThis.Buffer = Buffer;
  console.log('Basic Buffer polyfill loaded');
} catch (error) {
  console.error('Basic Buffer polyfill failed:', error);
  try {
    const { Buffer } = require('buffer');
    global.Buffer = Buffer;
    globalThis.Buffer = Buffer;
    console.log('Fallback Buffer polyfill loaded');
  } catch (fallbackError) {
    console.error('Fallback Buffer polyfill failed:', fallbackError);
  }
}

console.log('=== POLYFILLS-BASIC.JS END ===');
