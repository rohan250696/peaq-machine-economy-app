import { Platform } from 'react-native';

// Comprehensive polyfills before importing Privy
try {
  // Buffer polyfill
  if (typeof global.Buffer === 'undefined') {
    const { Buffer } = require('@craftzdog/react-native-buffer');
    global.Buffer = Buffer;
    globalThis.Buffer = Buffer;
    if (typeof window !== 'undefined') window.Buffer = Buffer;
  }

  // Process polyfill
  if (typeof global.process === 'undefined') {
    const process = require('process');
    global.process = process;
    globalThis.process = process;
  }

  // Crypto polyfill
  if (typeof global.crypto === 'undefined') {
    require('react-native-get-random-values');
  }

  // Text encoding polyfills
  require('fast-text-encoding');
  require('react-native-url-polyfill/auto');

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
  }

} catch (error) {
  console.error('Failed to load polyfills in usePlatformAuth:', error);
}

import { usePrivy, useLogin, useLogout, useWallets } from '@privy-io/react-auth';

// Platform-specific imports
// let usePrivy: any, useLogin: any, useLogout: any, useWallets: any;

// if (Platform.OS === 'web') {
//   const webPrivy = require('@privy-io/react-auth');
//   usePrivy = webPrivy.usePrivy;
//   useLogin = webPrivy.useLogin;
//   useLogout = webPrivy.useLogout;
//   useWallets = webPrivy.useWallets;
// } else {
//   const expoPrivy = require('@privy-io/expo');
//   usePrivy = expoPrivy.usePrivy;
//   useLogin = expoPrivy.useLogin;
//   useLogout = expoPrivy.useLogout;
//   useWallets = expoPrivy.useWallets;
// }

export { usePrivy, useLogin, useLogout, useWallets };
