// Background script - monitors clipboard system-wide
let lastClipboardContent = '';
let isMonitoring = false;
let authToken = null;
let backendUrl = 'http://localhost:3000';

// Start monitoring when extension loads
chrome.runtime.onStartup.addListener(async () => {
  console.log('Epitychia: Extension started');
  await loadAuthToken();
  startClipboardMonitoring();
});

chrome.runtime.onInstalled.addListener(async () => {
  console.log('Epitychia: Extension installed');
  await loadAuthToken();
  startClipboardMonitoring();
});

// Load auth token from storage
async function loadAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['authToken', 'backendUrl'], (result) => {
      authToken = result.authToken || null;
      backendUrl = result.backendUrl || 'http://localhost:3000';
      console.log('Epitychia: Auth token loaded:', !!authToken);
      resolve();
    });
  });
}

// Monitor clipboard every 500ms
function startClipboardMonitoring() {
  if (isMonitoring) return;
  isMonitoring = true;
  
  setInterval(async () => {
    try {
      // Read clipboard content
      const clipboardText = await navigator.clipboard.readText();
      
      // Check if content changed
      if (clipboardText && clipboardText !== lastClipboardContent) {
        lastClipboardContent = clipboardText;
        console.log('Epitychia: Clipboard changed:', clipboardText.substring(0, 50) + '...');
        
        // Notify all tabs about clipboard change
        notifyAllTabs(clipboardText);
        
        // Store in extension storage for popup access
        chrome.storage.local.set({
          lastClipboardContent: clipboardText,
          timestamp: Date.now()
        });
        
        // Send to backend if authenticated
        if (authToken) {
          await sendToBackend(clipboardText);
        }
      }
    } catch (error) {
      console.error('Epitychia: Error reading clipboard:', error);
    }
  }, 500);
}

// Notify all active tabs about clipboard change
async function notifyAllTabs(clipboardText) {
  try {
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'CLIPBOARD_CHANGED',
            content: clipboardText,
            timestamp: Date.now()
          });
        } catch (error) {
          // Tab might not have content script loaded, ignore
        }
      }
    }
  } catch (error) {
    console.error('Epitychia: Error notifying tabs:', error);
  }
}

// Send clipboard content to backend
async function sendToBackend(content) {
  if (!authToken) return;
  
  try {
    const response = await fetch(`${backendUrl}/api/clipboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content })
    });
    
    if (response.status === 401) {
      // Token expired, clear it
      authToken = null;
      chrome.storage.sync.remove(['authToken']);
      return;
    }
    
    if (response.ok) {
      console.log('Epitychia: Content synced to backend');
    }
  } catch (error) {
    console.error('Epitychia: Error syncing to backend:', error);
  }
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.type) {
      case 'GET_AI_SUGGESTIONS':
        const suggestions = await getAISuggestions(message.content);
        sendResponse({ success: true, suggestions });
        break;
        
      case 'APPLY_TRANSFORMATION':
        const result = await applyTransformation(message.content, message.transformation);
        sendResponse({ success: true, result });
        break;
        
      case 'LOGIN':
        const loginResult = await handleLogin(message.credentials);
        sendResponse(loginResult);
        break;
        
      case 'LOGOUT':
        await handleLogout();
        sendResponse({ success: true });
        break;
        
      case 'GET_STATUS':
        sendResponse({ 
          isMonitoring, 
          isAuthenticated: !!authToken,
          lastContent: lastClipboardContent?.substring(0, 50) + '...'
        });
        break;
        
      case 'GET_HISTORY':
        const history = await getClipboardHistory();
        sendResponse({ success: true, data: history });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Epitychia: Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle login
async function handleLogin(credentials) {
  try {
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (data.success && data.data?.token) {
      authToken = data.data.token;
      chrome.storage.sync.set({ authToken });
      return { success: true, user: data.data.user };
    } else {
      return { success: false, error: data.error || 'Login failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

// Handle logout
async function handleLogout() {
  authToken = null;
  chrome.storage.sync.remove(['authToken']);
}

// Get clipboard history from backend
async function getClipboardHistory() {
  if (!authToken) return [];
  
  try {
    const response = await fetch(`${backendUrl}/api/clipboard`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Epitychia: Error fetching history:', error);
    return [];
  }
}

// Get AI suggestions from your backend
async function getAISuggestions(content) {
  try {
    // Try to get suggestions from backend if authenticated
    if (authToken) {
      const response = await fetch(`${backendUrl}/api/generative/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.suggestions) {
          return result.data.suggestions.map(s => ({
            id: s.type,
            label: s.title,
            icon: s.icon
          }));
        }
      }
    }
    
    // Fallback suggestions if backend is down or not authenticated
    return [
      { id: 'summarize', label: 'Summarize', icon: '📝' },
      { id: 'professional', label: 'Make Professional', icon: '💼' },
      { id: 'grammar', label: 'Fix Grammar', icon: '✏️' },
      { id: 'email', label: 'Generate Email', icon: '📧' },
      { id: 'tasks', label: 'Create Tasks', icon: '✅' },
      { id: 'expand', label: 'Expand Idea', icon: '💡' }
    ];
  } catch (error) {
    console.error('Epitychia: Error getting AI suggestions:', error);
    // Fallback suggestions if backend is down
    return [
      { id: 'summarize', label: 'Summarize', icon: '📝' },
      { id: 'professional', label: 'Make Professional', icon: '💼' },
      { id: 'grammar', label: 'Fix Grammar', icon: '✏️' },
      { id: 'email', label: 'Generate Email', icon: '📧' },
      { id: 'tasks', label: 'Create Tasks', icon: '✅' },
      { id: 'expand', label: 'Expand Idea', icon: '💡' }
    ];
  }
}

// Apply AI transformation
async function applyTransformation(content, transformation) {
  try {
    // Try backend transformation if authenticated
    if (authToken) {
      const response = await fetch(`${backendUrl}/api/generative/${transformation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.transformedContent) {
          return result.data.transformedContent;
        }
      }
    }
    
    // Fallback transformations if backend fails or not authenticated
    switch(transformation) {
      case 'summarize':
        return `• ${content.split('.')[0]}.\n• Key points extracted from content.`;
      case 'professional':
        return `Dear Colleague,\n\n${content}\n\nBest regards,`;
      case 'grammar':
        return content.charAt(0).toUpperCase() + content.slice(1) + (content.endsWith('.') ? '' : '.');
      case 'email':
        return `Subject: Regarding Your Message\n\nDear Recipient,\n\n${content}\n\nBest regards,`;
      case 'tasks':
        return `TODO:\n• ${content}\n• Follow up on this item`;
      case 'expand':
        return `${content}\n\nThis concept can be further developed by considering multiple perspectives and exploring related ideas.`;
      default:
        return `[${transformation.toUpperCase()}] ${content}`;
    }
  } catch (error) {
    console.error('Epitychia: Error applying transformation:', error);
    // Return fallback transformation
    return `[${transformation.toUpperCase()}] ${content}`;
  }
}