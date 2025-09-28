#!/usr/bin/env node

/**
 * Test script to verify Chrome extension functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Chrome Extension Setup...\n');

// Check if all required files exist
const requiredFiles = [
  'chrome-extension/manifest.json',
  'chrome-extension/background.js',
  'chrome-extension/content.js',
  'chrome-extension/popup.js',
  'chrome-extension/popup.html',
  'chrome-extension/popup.css'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

// Check manifest.json structure
try {
  const manifest = JSON.parse(fs.readFileSync('chrome-extension/manifest.json', 'utf8'));
  
  console.log('\n📋 Manifest Check:');
  console.log(`✅ Version: ${manifest.version}`);
  console.log(`✅ Manifest Version: ${manifest.manifest_version}`);
  console.log(`✅ Permissions: ${manifest.permissions.join(', ')}`);
  
  if (manifest.background && manifest.background.service_worker) {
    console.log(`✅ Background Script: ${manifest.background.service_worker}`);
  }
  
  if (manifest.content_scripts && manifest.content_scripts.length > 0) {
    console.log(`✅ Content Scripts: ${manifest.content_scripts[0].js.join(', ')}`);
  }
  
} catch (error) {
  console.log('❌ Error reading manifest.json:', error.message);
}

// Check if backend is running
console.log('\n🔗 Backend Connection Test:');

const http = require('http');

function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const request = http.get(url, (res) => {
      console.log(`✅ ${name}: ${res.statusCode}`);
      resolve(true);
    });
    
    request.on('error', (error) => {
      console.log(`❌ ${name}: ${error.message}`);
      resolve(false);
    });
    
    request.setTimeout(3000, () => {
      console.log(`⏰ ${name}: Timeout`);
      request.destroy();
      resolve(false);
    });
  });
}

async function testBackend() {
  await testEndpoint('http://localhost:3000/health', 'Backend Health');
  await testEndpoint('http://localhost:3000/api/auth/health', 'Auth API');
  await testEndpoint('http://localhost:1420', 'Desktop App');
}

testBackend().then(() => {
  console.log('\n🎯 Chrome Extension Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Load the chrome-extension folder in Chrome Developer Mode');
  console.log('2. Make sure backend is running: cd backend && npm run dev');
  console.log('3. Make sure desktop app is running: cd desktop && npm run dev');
  console.log('4. Copy some text to test the AI popup');
  console.log('5. Check the extension popup by clicking the extension icon');
});