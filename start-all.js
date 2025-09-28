#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Epitychia Full Stack Application...\n');

// Start backend
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

let backendReady = false;

backend.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(`[BACKEND] ${output}`);
  
  if (output.includes('Server running on port') || output.includes('Memory storage initialized')) {
    if (!backendReady) {
      backendReady = true;
      console.log('\n✅ Backend is ready! Starting frontend...\n');
      startFrontend();
    }
  }
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`[BACKEND ERROR] ${data}`);
});

function startFrontend() {
  setTimeout(() => {
    console.log('🎨 Starting desktop application...');
    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'desktop'),
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    frontend.stdout.on('data', (data) => {
      process.stdout.write(`[FRONTEND] ${data}`);
    });

    frontend.stderr.on('data', (data) => {
      process.stderr.write(`[FRONTEND ERROR] ${data}`);
    });

    frontend.on('close', (code) => {
      console.log(`\n🛑 Frontend process exited with code ${code}`);
    });

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down all processes...');
      frontend.kill('SIGINT');
      backend.kill('SIGINT');
      process.exit(0);
    });
  }, 2000); // Wait 2 seconds for backend to fully start
}

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`\n🛑 Backend process exited with code ${code}`);
  process.exit(code);
});

console.log('💡 Tip: Once both servers are running:');
console.log('   • Backend API: http://localhost:3000');
console.log('   • Frontend App: http://localhost:3001');
console.log('   • Press Ctrl+C to stop all servers\n');