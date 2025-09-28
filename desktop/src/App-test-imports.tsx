import React from 'react';

function App() {
  console.log('App component rendering...');
  
  try {
    console.log('Testing imports...');
    
    // Test 1: Basic React
    console.log('✅ React imported successfully');
    
    // Test 2: Try importing auth store
    console.log('Attempting to import auth store...');
    
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Import Test</h1>
        <p>✅ React is working</p>
        <p>Check console for import test results</p>
      </div>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: 'red' }}>
        <h1>Error!</h1>
        <p>Check console for details</p>
        <pre>{String(error)}</pre>
      </div>
    );
  }
}

export default App;