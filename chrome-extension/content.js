// Content script - injected into all web pages
let isPopupVisible = false;
let popupElement = null;
let lastClipboardContent = '';
let lastPopupTime = 0;
const POPUP_COOLDOWN = 3000; // 3 seconds between popups

// Listen for clipboard changes from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLIPBOARD_CHANGED') {
    handleClipboardChange(message.content);
  }
});

// Monitor clipboard changes locally as well (with keyboard shortcuts)
document.addEventListener('keydown', (e) => {
  // Ctrl+C or Ctrl+X
  if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x')) {
    console.log('Epitychia: Copy/Cut detected, checking clipboard...');
    setTimeout(checkClipboard, 500); // Increased delay to ensure clipboard is updated
  }
});

// Monitor copy events directly
document.addEventListener('copy', (e) => {
  console.log('Epitychia: Copy event detected');
  const clipboardData = e.clipboardData || window.clipboardData;
  if (clipboardData) {
    const content = clipboardData.getData('text');
    if (content && content !== lastClipboardContent) {
      console.log('Epitychia: Copy content detected:', content.substring(0, 50) + '...');
      lastClipboardContent = content;
      handleClipboardChange(content);
    }
  }
  // Also check clipboard after a delay as backup
  setTimeout(checkClipboard, 300);
});

// Also monitor paste events to catch clipboard content
document.addEventListener('paste', (e) => {
  const clipboardData = e.clipboardData || window.clipboardData;
  if (clipboardData) {
    const content = clipboardData.getData('text');
    if (content && content !== lastClipboardContent) {
      lastClipboardContent = content;
      handleClipboardChange(content);
    }
  }
});

async function checkClipboard() {
  try {
    const clipboardText = await navigator.clipboard.readText();
    console.log('Epitychia: Clipboard content:', clipboardText?.substring(0, 50) + '...');
    if (clipboardText && clipboardText !== lastClipboardContent) {
      console.log('Epitychia: New clipboard content detected, processing...');
      handleClipboardChange(clipboardText);
    } else if (clipboardText === lastClipboardContent) {
      console.log('Epitychia: Same content as before, but processing anyway...');
      handleClipboardChange(clipboardText);
    }
  } catch (error) {
    // Clipboard access might be restricted, that's okay
    console.log('Epitychia: Clipboard access restricted on this page:', error.message);
  }
}

function handleClipboardChange(content) {
  console.log('Epitychia: Clipboard change detected:', content?.substring(0, 50) + '...');
  
  // Check cooldown period
  const now = Date.now();
  if (now - lastPopupTime < POPUP_COOLDOWN) {
    console.log('Epitychia: Popup cooldown active, skipping');
    return;
  }
  
  // Basic content validation - be more lenient
  if (!content || content.trim().length < 5) {
    console.log('Epitychia: Content too short, skipping');
    return;
  }
  
  // Don't show popup for very long content (likely not user-intended)
  if (content.length > 3000) {
    console.log('Epitychia: Content too long, skipping');
    return;
  }
  
  // Update last clipboard content but don't skip if it's the same
  // (user might want to transform the same content differently)
  lastClipboardContent = content;
  
  // Skip very short single words (but allow longer single words)
  if (!content.includes(' ') && content.length < 15) {
    console.log('Epitychia: Single short word, skipping');
    return;
  }
  
  console.log('Epitychia: Showing AI popup for content:', content.substring(0, 30) + '...');
  lastPopupTime = now;
  showAIPopup(content);
}

async function showAIPopup(content) {
  if (isPopupVisible) {
    hideAIPopup();
  }
  
  // Create popup element
  popupElement = document.createElement('div');
  popupElement.id = 'epitychia-ai-popup';
  popupElement.innerHTML = await createPopupHTML(content);
  
  // Add to page with higher z-index to appear over everything
  document.body.appendChild(popupElement);
  isPopupVisible = true;
  
  // Setup event listeners
  setupPopupEvents(content);
  
  // Auto-hide after 15 seconds
  setTimeout(() => {
    if (isPopupVisible) {
      hideAIPopup();
    }
  }, 15000);
}

function hideAIPopup() {
  if (popupElement) {
    popupElement.remove();
    popupElement = null;
  }
  isPopupVisible = false;
}

async function createPopupHTML(content) {
  // Get AI suggestions
  const suggestions = await getSuggestions(content);
  
  const suggestionsHTML = suggestions.map(suggestion => 
    `<button class="suggestion-btn" data-action="${suggestion.id}">
      ${suggestion.icon} ${suggestion.label}
    </button>`
  ).join('');
  
  return `
    <div class="popup-header">
      <span class="popup-title">🎯 AI Assistant</span>
      <button class="close-btn" id="closePopup">×</button>
    </div>
    <div class="popup-content">
      <div class="content-preview">${truncateText(content, 100)}</div>
      <div class="suggestions">
        ${suggestionsHTML}
      </div>
    </div>
    <style>
      #epitychia-ai-popup {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        width: 320px !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 12px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
        z-index: 2147483647 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        color: white !important;
        animation: slideIn 0.3s ease-out !important;
        border: 2px solid rgba(255,255,255,0.3) !important;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%) !important;
          opacity: 0 !important;
        }
        to {
          transform: translateX(0) !important;
          opacity: 1 !important;
        }
      }
      
      #epitychia-ai-popup .popup-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 15px 20px !important;
        border-bottom: 1px solid rgba(255,255,255,0.2) !important;
      }
      
      #epitychia-ai-popup .popup-title {
        font-weight: 600 !important;
        font-size: 16px !important;
        color: white !important;
      }
      
      #epitychia-ai-popup .close-btn {
        background: none !important;
        border: none !important;
        color: white !important;
        font-size: 20px !important;
        cursor: pointer !important;
        padding: 0 !important;
        width: 24px !important;
        height: 24px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 50% !important;
        transition: background 0.2s !important;
      }
      
      #epitychia-ai-popup .close-btn:hover {
        background: rgba(255,255,255,0.2) !important;
      }
      
      #epitychia-ai-popup .popup-content {
        padding: 20px !important;
      }
      
      #epitychia-ai-popup .content-preview {
        background: rgba(255,255,255,0.1) !important;
        border-radius: 8px !important;
        padding: 12px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        margin-bottom: 15px !important;
        max-height: 60px !important;
        overflow: hidden !important;
        color: white !important;
      }
      
      #epitychia-ai-popup .suggestions {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
      }
      
      #epitychia-ai-popup .suggestion-btn {
        background: rgba(255,255,255,0.2) !important;
        border: none !important;
        border-radius: 6px !important;
        padding: 10px 12px !important;
        color: white !important;
        font-size: 13px !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        text-align: left !important;
      }
      
      #epitychia-ai-popup .suggestion-btn:hover {
        background: rgba(255,255,255,0.3) !important;
        transform: translateY(-1px) !important;
      }
      
      #epitychia-ai-popup .suggestion-btn:active {
        transform: translateY(0) !important;
      }
    </style>
  `;
}

function setupPopupEvents(content) {
  // Close button
  const closeBtn = popupElement.querySelector('#closePopup');
  closeBtn.addEventListener('click', hideAIPopup);
  
  // Suggestion buttons
  const suggestionBtns = popupElement.querySelectorAll('.suggestion-btn');
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      await handleSuggestionClick(action, content);
      hideAIPopup();
    });
  });
  
  // Click outside to close (with delay to prevent immediate closing)
  setTimeout(() => {
    document.addEventListener('click', (e) => {
      if (isPopupVisible && !popupElement.contains(e.target)) {
        hideAIPopup();
      }
    }, { once: true });
  }, 100);
}

async function getSuggestions(content) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_AI_SUGGESTIONS',
      content: content
    });
    
    if (response && response.success) {
      return response.suggestions;
    }
  } catch (error) {
    console.error('Error getting suggestions:', error);
  }
  
  // Fallback suggestions
  return [
    { id: 'summarize', label: 'Summarize', icon: '📝' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'grammar', label: 'Fix Grammar', icon: '✏️' },
    { id: 'email', label: 'Email Draft', icon: '📧' },
    { id: 'tasks', label: 'Create Tasks', icon: '✅' },
    { id: 'expand', label: 'Expand Idea', icon: '💡' }
  ];
}

async function handleSuggestionClick(action, content) {
  try {
    // Show loading state
    showNotification('Processing...', 'info');
    
    const response = await chrome.runtime.sendMessage({
      type: 'APPLY_TRANSFORMATION',
      content: content,
      transformation: action
    });
    
    if (response && response.success) {
      // Copy result to clipboard
      await navigator.clipboard.writeText(response.result);
      showNotification('✅ Result copied to clipboard!', 'success');
    } else {
      showNotification('❌ Processing failed', 'error');
    }
  } catch (error) {
    console.error('Error applying transformation:', error);
    showNotification('❌ Error occurred', 'error');
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'} !important;
    color: white !important;
    padding: 12px 20px !important;
    border-radius: 6px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 14px !important;
    z-index: 2147483647 !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    animation: slideDown 0.3s ease-out !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Initialize
console.log('🎯 Epitychia: Content script loaded on', window.location.hostname);
console.log('🎯 Epitychia: Content script version 1.1 - popup should work now');

// Test if we can access clipboard API
if (navigator.clipboard) {
  console.log('✅ Clipboard API available');
} else {
  console.log('❌ Clipboard API not available');
}

// Test popup removed - no more automatic popups

// Add manual triggers for testing
window.addEventListener('keydown', (e) => {
  // Ctrl+Shift+T to manually trigger popup
  if (e.ctrlKey && e.shiftKey && e.key === 'T') {
    console.log('🧪 Manual popup trigger activated');
    showAIPopup('Manual test popup triggered with Ctrl+Shift+T - this is a longer text to test the AI transformations');
  }
  
  // Ctrl+Shift+P to test with different content
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    console.log('🧪 Manual popup trigger with professional text');
    showAIPopup('hey can you help me with this project? i need to get it done asap and its really important for the meeting tomorrow');
  }
});