// Safe slice utilities to prevent "slice of undefined" errors

export const safeSlice = {
  // Safe string slice that never throws
  string: (str: any, start: number = 0, end?: number): string => {
    if (!str || typeof str !== 'string') {
      return '';
    }
    
    const length = str.length;
    if (length === 0) {
      return '';
    }
    
    // Handle negative indices
    const startIndex = start < 0 ? Math.max(length + start, 0) : Math.min(start, length);
    const endIndex = end === undefined ? length : (end < 0 ? Math.max(length + end, 0) : Math.min(end, length));
    
    // Use substring instead of slice to avoid any potential issues
    return str.substring(startIndex, endIndex);
  },

  // Safe array slice that never throws
  array: (arr: any, start: number = 0, end?: number): any[] => {
    if (!arr || !Array.isArray(arr)) {
      return [];
    }
    
    const length = arr.length;
    if (length === 0) {
      return [];
    }
    
    // Handle negative indices
    const startIndex = start < 0 ? Math.max(length + start, 0) : Math.min(start, length);
    const endIndex = end === undefined ? length : (end < 0 ? Math.max(length + end, 0) : Math.min(end, length));
    
    // Manual slice implementation
    const result = [];
    for (let i = startIndex; i < endIndex; i++) {
      result.push(arr[i]);
    }
    return result;
  },

  // Safe address truncation
  truncateAddress: (address: any): string => {
    if (!address || typeof address !== 'string' || address.length === 0) {
      return '0x0000...0000';
    }
    
    if (address.length < 10) {
      return address;
    }
    
    const start = safeSlice.string(address, 0, 6);
    const end = safeSlice.string(address, -4);
    return `${start}...${end}`;
  },

  // Safe transaction hash truncation
  truncateHash: (hash: any): string => {
    if (!hash || typeof hash !== 'string' || hash.length === 0) {
      return '0x00000000...00000000';
    }
    
    if (hash.length < 18) {
      return hash;
    }
    
    const start = safeSlice.string(hash, 0, 10);
    const end = safeSlice.string(hash, -8);
    return `${start}...${end}`;
  }
};

// Export individual functions for convenience
export const safeStringSlice = safeSlice.string;
export const safeArraySlice = safeSlice.array;
export const safeTruncateAddress = safeSlice.truncateAddress;
export const safeTruncateHash = safeSlice.truncateHash;
