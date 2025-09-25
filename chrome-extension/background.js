// Background script - monitors clipboard system-wide
let lastClipboardContent = '';
let isMonitoring = false;

// Start monitoring when extension loads
chrome.runtime.onStartup.addListener(() => {
  console.log('Epitychia: Extension started');
  startClipboardMonitoring();
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Epitychia: Extension installed');
  startClipboardMonitoring();
});

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

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_AI_SUGGESTIONS') {
    // Forward to your backend API
    getAISuggestions(message.content)
      .then(suggestions => sendResponse({ success: true, suggestions }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'APPLY_TRANSFORMATION') {
    // Apply AI transformation
    applyTransformation(message.content, message.transformation)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }
});

// Get AI suggestions from your backend
async function getAISuggestions(content) {
  try {
    const response = await fetch('http://localhost:3001/api/generative/suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get AI suggestions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Epitychia: Error getting AI suggestions:', error);
    // Fallback suggestions if backend is down
    return [
      { id: 'summarize', label: 'Summarize', icon: '📝' },
      { id: 'professional', label: 'Make Professional', icon: '💼' },
      { id: 'grammar', label: 'Fix Grammar', icon: '✏️' },
      { id: 'email', label: 'Generate Email', icon: '📧' },
      { id: 'tasks', label: 'Create Tasks', icon: '✅' },
      { id: 'translate', label: 'Translate', icon: '🌐' }
    ];
  }
}

// Apply AI transformation
async function applyTransformation(content, transformation) {
  try {
    const response = await fetch(`http://localhost:3001/api/generative/${transformation}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error('Failed to apply transformation');
    }
    
    const result = await response.json();
    return result.transformedContent;
  } catch (error) {
    console.error('Epitychia: Error applying transformation:', error);
    // Fallback transformation
    return `[${transformation.toUpperCase()}] ${content}`;
  }
}