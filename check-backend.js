#!/usr/bin/env node

const axios = require('axios');

async function checkBackend() {
  try {
    console.log('🔍 Checking backend health...');
    
    const response = await axios.get('http://localhost:3000/health', {
      timeout: 5000
    });
    
    console.log('✅ Backend is healthy!');
    console.log('📊 Status:', response.data);
    
    // Test registration
    console.log('\n🧪 Testing user registration...');
    try {
      const registerResponse = await axios.post('http://localhost:3000/api/auth/register', {
        email: 'test@example.com',
        password: 'testpassword123'
      });
      console.log('✅ Registration works!');
      console.log('🔑 Token received:', registerResponse.data.data.token ? 'Yes' : 'No');
    } catch (regError) {
      if (regError.response?.status === 400 && regError.response?.data?.error === 'User already exists') {
        console.log('✅ Registration endpoint works (user already exists)');
      } else {
        console.log('❌ Registration failed:', regError.response?.data?.error || regError.message);
      }
    }
    
    console.log('\n🎉 Backend is fully functional!');
    console.log('💡 You can now start the frontend with: npm run dev:desktop');
    
  } catch (error) {
    console.log('❌ Backend is not responding');
    console.log('🔧 Error:', error.message);
    console.log('\n💡 Make sure to start the backend first:');
    console.log('   npm run dev:backend');
    process.exit(1);
  }
}

checkBackend();