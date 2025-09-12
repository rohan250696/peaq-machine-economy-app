// Simple polyfill test
console.log('=== SIMPLE POLYFILL TEST ===');

// Try to show an alert to confirm this file is executing
try {
  if (typeof global !== 'undefined' && global.alert) {
    global.alert('Polyfills are loading!');
  }
} catch (alertError) {
  console.log('Alert not available:', alertError.message);
}

try {
  const { Buffer } = require('buffer');
  global.Buffer = Buffer;
  globalThis.Buffer = Buffer;
  console.log('Simple Buffer polyfill loaded successfully');
  
  // Test Buffer functionality
  const testBuffer = Buffer.from('test');
  console.log('Buffer test successful:', testBuffer.toString());
} catch (error) {
  console.error('Simple Buffer polyfill failed:', error);
}

console.log('=== SIMPLE POLYFILL TEST END ===');
