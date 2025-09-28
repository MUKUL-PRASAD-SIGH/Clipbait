import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated, loading, initialize: initAuth, error } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState('Starting...');

  useEffect(() => {
    setDebugInfo('Initializing auth...');
    initAuth().then(() => {
      setDebugInfo('Auth initialized');
    }).catch((err) => {
      setDebugInfo(`Auth error: ${err.message}`);
    });
  }, [initAuth]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Epitychia Debug</h1>
      <div style={{ marginBottom: '20px' }}>
        <h3>Debug Info:</h3>
        <p>Status: {debugInfo}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
      </div>
      
      {loading && <p>🔄 Loading...</p>}
      
      {!loading && !isAuthenticated && (
        <div>
          <h3>Not Authenticated</h3>
          <p>You need to log in</p>
        </div>
      )}
      
      {!loading && isAuthenticated && (
        <div>
          <h3>✅ Authenticated!</h3>
          <p>Welcome to Epitychia</p>
        </div>
      )}
    </div>
  );
}

export default App;