#!/usr/bin/env node

/**
 * Test script to verify that all UI functionality is working
 * This script tests the backend API endpoints and basic functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = null;
let testUserId = null;

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

const testClipboardContent = 'Contact John Doe at john.doe@example.com or call (555) 123-4567 for the meeting on Monday at 2 PM.';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(name, fn) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    await fn();
    console.log(`✅ ${name} - PASSED`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} - FAILED:`, error.response?.data?.error || error.message);
    return false;
  }
}

async function testHealthCheck() {
  const response = await axios.get(`${BASE_URL}/health`);
  console.log('Health check response:', response.data);
}

async function testUserRegistration() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    authToken = response.data.data.token;
    testUserId = response.data.data.user.id;
    console.log('User registered with ID:', testUserId);
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error === 'User already exists') {
      // User already exists, try to login instead
      console.log('User already exists, attempting login...');
      await testUserLogin();
    } else {
      throw error;
    }
  }
}

async function testUserLogin() {
  const response = await axios.post(`${BASE_URL}/api/auth/login`, testUser);
  authToken = response.data.data.token;
  console.log('User logged in successfully');
}

async function testGetUserProfile() {
  const response = await axios.get(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('User profile:', response.data.data.email);
}

async function testAddClipboardItem() {
  const response = await axios.post(`${BASE_URL}/api/clipboard`, {
    content: testClipboardContent,
    contentType: 'text'
  }, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Clipboard item added with ID:', response.data.data.id);
  return response.data.data.id;
}

async function testGetClipboardHistory() {
  const response = await axios.get(`${BASE_URL}/api/clipboard`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Clipboard history retrieved:', response.data.data.length, 'items');
  return response.data.data;
}

async function testPinClipboardItem(itemId) {
  const response = await axios.post(`${BASE_URL}/api/clipboard/${itemId}/pin`, {}, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Item pinned successfully');
}

async function testCommandPaletteSearch() {
  const response = await axios.get(`${BASE_URL}/api/command-palette/search?q=test`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Command palette search results:', response.data.data.results.length);
}

async function testCommandPaletteSuggestions() {
  const response = await axios.get(`${BASE_URL}/api/command-palette/suggestions`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Command palette suggestions:', response.data.data.suggestions.length);
}

async function testCreateCollection() {
  const response = await axios.post(`${BASE_URL}/api/collections`, {
    name: 'Test Collection',
    description: 'A test collection for functionality testing'
  }, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Collection created with ID:', response.data.data.id);
  return response.data.data.id;
}

async function testGetCollections() {
  const response = await axios.get(`${BASE_URL}/api/collections`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Collections retrieved:', response.data.data.length);
}

async function testStagingArea() {
  const response = await axios.get(`${BASE_URL}/api/staging`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Staging area status:', response.data.data ? 'Active' : 'Empty');
}

async function testGenerativeTransformations() {
  const response = await axios.post(`${BASE_URL}/api/generative/transform`, {
    content: testClipboardContent,
    contentType: 'text'
  }, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Transformations generated:', response.data.data.transformations.length);
}

async function testGenerateEmail() {
  const response = await axios.post(`${BASE_URL}/api/generative/email`, {
    content: 'Meeting about project updates tomorrow at 2 PM'
  }, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('Email generated successfully');
}

async function runAllTests() {
  console.log('🚀 Starting Epitychia Functionality Tests\n');
  
  let passed = 0;
  let total = 0;

  // Test basic connectivity
  total++;
  if (await testEndpoint('Health Check', testHealthCheck)) passed++;

  // Test authentication
  total++;
  if (await testEndpoint('User Registration', testUserRegistration)) passed++;
  
  total++;
  if (await testEndpoint('User Login', testUserLogin)) passed++;
  
  total++;
  if (await testEndpoint('Get User Profile', testGetUserProfile)) passed++;

  // Test clipboard functionality
  let clipboardItemId;
  total++;
  if (await testEndpoint('Add Clipboard Item', async () => {
    clipboardItemId = await testAddClipboardItem();
  })) passed++;

  total++;
  if (await testEndpoint('Get Clipboard History', testGetClipboardHistory)) passed++;

  if (clipboardItemId) {
    total++;
    if (await testEndpoint('Pin Clipboard Item', () => testPinClipboardItem(clipboardItemId))) passed++;
  }

  // Test command palette
  total++;
  if (await testEndpoint('Command Palette Search', testCommandPaletteSearch)) passed++;
  
  total++;
  if (await testEndpoint('Command Palette Suggestions', testCommandPaletteSuggestions)) passed++;

  // Test collections
  total++;
  if (await testEndpoint('Create Collection', testCreateCollection)) passed++;
  
  total++;
  if (await testEndpoint('Get Collections', testGetCollections)) passed++;

  // Test staging area
  total++;
  if (await testEndpoint('Staging Area', testStagingArea)) passed++;

  // Test generative AI features
  total++;
  if (await testEndpoint('Generative Transformations', testGenerativeTransformations)) passed++;
  
  total++;
  if (await testEndpoint('Generate Email', testGenerateEmail)) passed++;

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! The UI should be fully functional.');
  } else {
    console.log(`⚠️  ${total - passed} tests failed. Some functionality may not work properly.`);
  }
  
  console.log('\n💡 To test the UI:');
  console.log('1. Start the backend: cd backend && npm run dev');
  console.log('2. Start the desktop app: cd desktop && npm run dev');
  console.log('3. Open http://localhost:3001 in your browser');
  console.log('4. Register/login and test the features');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('Checking if backend server is running...');
  
  const isRunning = await checkServer();
  if (!isRunning) {
    console.log('❌ Backend server is not running!');
    console.log('Please start the backend server first:');
    console.log('  cd backend && npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Backend server is running');
  await runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runAllTests };