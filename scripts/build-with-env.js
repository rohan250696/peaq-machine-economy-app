#!/usr/bin/env node

/**
 * Build script that ensures environment variables are properly injected
 * This is a backup approach if the injection script fails
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build with environment variable injection...');

// Get environment variable
const kbwAppWalletKey = process.env.KBW_APP_WALLET_KEY;

if (!kbwAppWalletKey) {
  console.error('❌ KBW_APP_WALLET_KEY environment variable is required');
  process.exit(1);
}

//console.log(`✅ KBW_APP_WALLET_KEY found (${kbwAppWalletKey.length} characters)`);

// Method 1: Try injection script
try {
  console.log('📝 Method 1: Running injection script...');
  execSync('node scripts/inject-env.js', { stdio: 'inherit' });
  console.log('✅ Injection script completed');
} catch (error) {
  console.warn('⚠️ Injection script failed, trying direct method...');
  
  // Method 2: Direct app.json modification
  try {
    const appJsonPath = path.join(__dirname, '..', 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    if (!appJson.expo.extra) {
      appJson.expo.extra = {};
    }
    
    appJson.expo.extra.kbwAppWalletKey = kbwAppWalletKey;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    
    console.log('✅ Direct injection successful');
  } catch (directError) {
    console.error('❌ Direct injection also failed:', directError.message);
    process.exit(1);
  }
}

// Method 3: Create a constants file as backup
try {
  const constantsPath = path.join(__dirname, '..', 'src', 'config', 'injected-env.ts');
  const constantsContent = `// Auto-generated environment constants
// This file is created during build process
export const INJECTED_ENV = {
  KBW_APP_WALLET_KEY: '${kbwAppWalletKey}',
} as const;
`;
  
  fs.writeFileSync(constantsPath, constantsContent);
  console.log('✅ Backup constants file created');
} catch (error) {
  console.warn('⚠️ Failed to create backup constants file:', error.message);
}

// Verify the injection worked
try {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const verifyJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const injectedValue = verifyJson.expo?.extra?.kbwAppWalletKey;
  
  if (injectedValue === kbwAppWalletKey) {
    // console.log('🎯 Final verification: Environment variable properly injected');
    // console.log(`📝 Value: ${injectedValue.slice(0, 10)}...${injectedValue.slice(-4)}`);
  } else {
    // console.error('❌ Final verification failed');
    // console.log(`Expected: ${kbwAppWalletKey.slice(0, 10)}...`);
    // console.log(`Got: ${injectedValue}`);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
}

console.log('🎉 Environment variable injection completed successfully!');
