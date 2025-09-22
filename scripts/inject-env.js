#!/usr/bin/env node

/**
 * Script to inject environment variables into app.json before build
 * This ensures the variables are available in the final bundle
 */

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');

// console.log('🔧 Starting environment variable injection...');
// console.log(`📁 Working directory: ${process.cwd()}`);
// console.log(`📄 app.json path: ${appJsonPath}`);

// Check if app.json exists
if (!fs.existsSync(appJsonPath)) {
  console.error(`❌ app.json not found at: ${appJsonPath}`);
  process.exit(1);
}

// Read the current app.json
let appJson;
try {
  const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
  console.log(`📖 Read app.json (${appJsonContent.length} characters)`);
  appJson = JSON.parse(appJsonContent);
} catch (error) {
  console.error('❌ Failed to read/parse app.json:', error.message);
  process.exit(1);
}

// Get environment variable
const kbwAppWalletKey = process.env.KBW_APP_WALLET_KEY;

// console.log('🔍 Environment variable check:');
// console.log(`  KBW_APP_WALLET_KEY: ${kbwAppWalletKey ? 'SET' : 'NOT SET'}`);
// console.log(`  Length: ${kbwAppWalletKey?.length || 0}`);

if (!kbwAppWalletKey) {
  // console.error('❌ KBW_APP_WALLET_KEY environment variable is not set');
  // console.log('💡 Make sure to set it before running this script:');
  // console.log('   KBW_APP_WALLET_KEY=your_key_here node scripts/inject-env.js');
  process.exit(1);
}

// Ensure expo.extra exists
if (!appJson.expo) {
  appJson.expo = {};
}
if (!appJson.expo.extra) {
  appJson.expo.extra = {};
}

// Store original value for comparison
const originalValue = appJson.expo.extra.kbwAppWalletKey;
// console.log(`📝 Original value: ${originalValue}`);

// Update the app.json with the actual value
appJson.expo.extra.kbwAppWalletKey = kbwAppWalletKey;

// Write back to app.json
try {
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  // console.log('✅ Environment variables injected successfully');
  // console.log(`📝 Updated app.json with kbwAppWalletKey: ${kbwAppWalletKey.slice(0, 10)}...`);
  
  // Verify the write was successful
  const verifyContent = fs.readFileSync(appJsonPath, 'utf8');
  const verifyJson = JSON.parse(verifyContent);
  const injectedValue = verifyJson.expo.extra.kbwAppWalletKey;
  
  if (injectedValue === kbwAppWalletKey) {
    console.log('✅ Verification successful: Key properly injected');
  } else {
    console.error('❌ Verification failed: Key not properly injected');
    console.log(`Expected: ${kbwAppWalletKey.slice(0, 10)}...`);
    console.log(`Got: ${injectedValue}`);
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Failed to write app.json:', error.message);
  process.exit(1);
}
