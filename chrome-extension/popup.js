// Popup script for Epitychia extension
document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
});

async function initializePopup() {
  // Check authentication status
  const status = await sendMessage({ type: 'GET_STATUS' });
  
  if (status.isAuthenticated) {
    showMainInterface(status);
  } else {
    showLoginInterface();
  }
}

function showLoginInterface() {
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('mainSection').classList.add('hidden');
  
  // Setup login form
  const loginBtn = document.getElementById('loginBtn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('loginError');
  
  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
      const result = await sendMessage({
        type: 'LOGIN',
        credentials: { email, password }
      });
      
      if (result.success) {
        // Login successful, switch to main interface
        const status = await sendMessage({ type: 'GET_STATUS' });
        showMainInterface(status);
      } else {
        showError(result.error || 'Login failed');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  });
  
  // Allow Enter key to submit
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });
  
  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
      errorDiv.classList.add('hidden');
    }, 5000);
  }
}

function showMainInterface(status) {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('mainSection').classList.remove('hidden');
  
  // Update status display
  updateStatus(status);
  
  // Load recent items
  loadRecentItems();
  
  // Setup event listeners
  setupMainInterfaceEvents();
}

function updateStatus(status) {
  const statusEl = document.getElementById('status');
  const itemCountEl = document.getElementById('itemCount');
  const lastActivityEl = document.getElementById('lastActivity');
  
  statusEl.textContent = status.isMonitoring ? 'Active' : 'Inactive';
  itemCountEl.textContent = '0'; // Will be updated when history loads
  lastActivityEl.textContent = status.lastContent ? 'Just now' : 'Never';
}

async function loadRecentItems() {
  try {
    const result = await sendMessage({ type: 'GET_HISTORY' });
    const recentList = document.getElementById('recentList');
    
    if (result.success && result.data && result.data.length > 0) {
      recentList.innerHTML = '';
      
      // Show up to 3 most recent items
      const recentItems = result.data.slice(0, 3);
      document.getElementById('itemCount').textContent = result.data.length;
      
      recentItems.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'recent-item';
        itemEl.innerHTML = `
          <div>${truncateText(item.content, 60)}</div>
          <div class="timestamp">${formatTime(item.createdAt)}</div>
        `;
        
        itemEl.addEventListener('click', () => {
          copyToClipboard(item.content);
        });
        
        recentList.appendChild(itemEl);
      });
    } else {
      recentList.innerHTML = '<div class="recent-item">No recent items</div>';
    }
  } catch (error) {
    console.error('Error loading recent items:', error);
    document.getElementById('recentList').innerHTML = '<div class="recent-item">Error loading items</div>';
  }
}

function setupMainInterfaceEvents() {
  // Open Dashboard
  document.getElementById('openDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:1420' });
  });
  
  // Capture Now
  document.getElementById('captureNow').addEventListener('click', async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        // Send to background script to process
        await sendMessage({ type: 'CLIPBOARD_COPY', content: clipboardText });
        
        // Refresh recent items
        setTimeout(loadRecentItems, 1000);
        
        showNotification('Clipboard captured!');
      } else {
        showNotification('No clipboard content found');
      }
    } catch (error) {
      showNotification('Error accessing clipboard');
    }
  });
  
  // View History
  document.getElementById('viewHistory').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:1420/history' });
  });
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await sendMessage({ type: 'LOGOUT' });
    showLoginInterface();
  });
}

// Utility functions
function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, resolve);
  });
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function formatTime(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!');
  } catch (error) {
    showNotification('Error copying to clipboard');
  }
}

function showNotification(message) {
  // Create a temporary notification element
  const notification = document.createElement('div');
  notification.className = 'success';
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.zIndex = '1000';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 2000);
}