// Content script - runs on every page and shows AI popup
let aiPopup = null;
let isPopupVisible = false;
let hideTimeout = null;

// Listen for clipboard changes from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLIPBOARD_CHANGED') {
    console.log('Epitychia: Received clipboard change:', message.content.substring(0, 50) + '...');
    showAIPopup(message.content);
  }
});

// Show AI popup with transformation options
async function showAIPopup(clipboardContent) {
  // Don't show popup if content is too short or looks like a password
  if (!clipboardContent || clipboardContent.length < 3 || isLikelyPassword(clipboardContent)) {
    return;
  }
  
  // Remove existing popup
  hideAIPopup();
  
  // Inject CSS if not already injected
  if (!document.getElementById('epitychia-styles')) {
    injectStyles();
  }
  
  // Create popup element
  aiPopup = document.createElement('div');
  aiPopup.id = 'epitychia-ai-popup';
  aiPopup.className = 'epitychia-popup';
  
  // Get AI suggestions
  const suggestions = await getAISuggestions(clipboardContent);
  
  // Build popup HTML
  aiPopup.innerHTML = `
    <div class="epitychia-popup-header">
      <div class="epitychia-popup-title">
        <span class="epitychia-icon">🤖</span>
        Transform Clipboard
      </div>
      <button class="epitychia-close-btn" onclick="this.closest('.epitychia-popup').remove()">×</button>
    </div>
    <div class="epitychia-popup-content">
      <div class="epitychia-clipboard-preview">
        "${clipboardContent.substring(0, 100)}${clipboardContent.length > 100 ? '...' : ''}"
      </div>
      <div class="epitychia-suggestions">
        ${suggestions.map(suggestion => `
          <button class="epitychia-suggestion-btn" data-action="${suggestion.id}" data-content="${encodeURIComponent(clipboardContent)}">
            <span class="epitychia-suggestion-icon">${suggestion.icon}</span>
            <span class="epitychia-suggestion-label">${suggestion.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add event listeners
  aiPopup.addEventListener('click', handlePopupClick);
  
  // Position popup at top-right of viewport
  aiPopup.style.position = 'fixed';
  aiPopup.style.top = '20px';
  aiPopup.style.right = '20px';
  aiPopup.style.zIndex = '999999';
  
  // Add to page
  document.body.appendChild(aiPopup);
  isPopupVisible = true;
  
  // Auto-hide after 10 seconds
  hideTimeout = setTimeout(() => {
    hideAIPopup();
  }, 10000);
  
  console.log('Epitychia: AI popup shown');
}

// Handle popup button clicks
async function handlePopupClick(event) {
  const button = event.target.closest('.epitychia-suggestion-btn');
  if (!button) return;
  
  const action = button.dataset.action;
  const content = decodeURIComponent(button.dataset.content);
  
  // Show loading state
  button.innerHTML = '<span class="epitychia-loading">⏳</span> Processing...';
  button.disabled = true;
  
  try {
    // Apply transformation via background script
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'APPLY_TRANSFORMATION',
        content: content,
        transformation: action
      }, resolve);
    });
    
    if (response.success) {
      // Copy transformed content to clipboard
      await navigator.clipboard.writeText(response.result);
      
      // Show success feedback
      button.innerHTML = '<span class="epitychia-success">✅</span> Copied!';
      
      // Hide popup after success
      setTimeout(() => {
        hideAIPopup();
      }, 1500);
      
      console.log('Epitychia: Transformation applied and copied');
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Epitychia: Error applying transformation:', error);
    button.innerHTML = '<span class="epitychia-error">❌</span> Error';
    
    // Reset button after error
    setTimeout(() => {
      button.disabled = false;
      button.innerHTML = `<span class="epitychia-suggestion-icon">${button.dataset.icon}</span> ${button.dataset.label}`;
    }, 2000);
  }
}

// Hide AI popup
function hideAIPopup() {
  if (aiPopup && aiPopup.parentNode) {
    aiPopup.parentNode.removeChild(aiPopup);
  }
  aiPopup = null;
  isPopupVisible = false;
  
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

// Get AI suggestions from background script
async function getAISuggestions(content) {
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'GET_AI_SUGGESTIONS',
        content: content
      }, resolve);
    });
    
    if (response.success) {
      return response.suggestions;
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Epitychia: Error getting suggestions:', error);
    // Return fallback suggestions
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

// Check if content looks like a password
function isLikelyPassword(content) {
  // Skip very short content
  if (content.length < 3) return true;
  
  // Skip if looks like password (no spaces, mixed case, special chars)
  if (content.length < 50 && 
      !content.includes(' ') && 
      /[A-Z]/.test(content) && 
      /[a-z]/.test(content) && 
      /[0-9!@#$%^&*]/.test(content)) {
    return true;
  }
  
  return false;
}

// Inject CSS styles
function injectStyles() {
  const styleId = 'epitychia-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Epitychia AI Popup Styles */
    .epitychia-popup {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      background: #ffffff !important;
      border: 1px solid #e1e5e9 !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
      width: 320px !important;
      max-width: 90vw !important;
      animation: epitychia-slide-in 0.3s ease-out !important;
      backdrop-filter: blur(10px) !important;
      z-index: 999999 !important;
      position: fixed !important;
    }

    @keyframes epitychia-slide-in {
      from {
        opacity: 0;
        transform: translateX(100%) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    .epitychia-popup-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 16px 20px 12px !important;
      border-bottom: 1px solid #f0f0f0 !important;
    }

    .epitychia-popup-title {
      display: flex !important;
      align-items: center !important;
      font-weight: 600 !important;
      font-size: 14px !important;
      color: #1a1a1a !important;
    }

    .epitychia-icon {
      margin-right: 8px !important;
      font-size: 16px !important;
    }

    .epitychia-close-btn {
      background: none !important;
      border: none !important;
      font-size: 18px !important;
      color: #666 !important;
      cursor: pointer !important;
      padding: 4px !important;
      border-radius: 4px !important;
      transition: background-color 0.2s !important;
    }

    .epitychia-close-btn:hover {
      background-color: #f5f5f5 !important;
      color: #333 !important;
    }

    .epitychia-popup-content {
      padding: 16px 20px 20px !important;
    }

    .epitychia-clipboard-preview {
      background: #f8f9fa !important;
      border: 1px solid #e9ecef !important;
      border-radius: 6px !important;
      padding: 12px !important;
      font-size: 12px !important;
      color: #495057 !important;
      margin-bottom: 16px !important;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace !important;
      line-height: 1.4 !important;
      max-height: 60px !important;
      overflow: hidden !important;
      position: relative !important;
    }

    .epitychia-suggestions {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
    }

    .epitychia-suggestion-btn {
      display: flex !important;
      align-items: center !important;
      padding: 12px !important;
      background: #ffffff !important;
      border: 1px solid #e1e5e9 !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      color: #374151 !important;
      text-align: left !important;
    }

    .epitychia-suggestion-btn:hover {
      background: #f8fafc !important;
      border-color: #3b82f6 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
    }

    .epitychia-suggestion-btn:active {
      transform: translateY(0) !important;
    }

    .epitychia-suggestion-btn:disabled {
      opacity: 0.7 !important;
      cursor: not-allowed !important;
      transform: none !important;
    }

    .epitychia-suggestion-icon {
      margin-right: 8px !important;
      font-size: 14px !important;
      flex-shrink: 0 !important;
    }

    .epitychia-suggestion-label {
      flex: 1 !important;
      line-height: 1.3 !important;
    }

    .epitychia-loading {
      animation: epitychia-spin 1s linear infinite !important;
    }

    @keyframes epitychia-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .epitychia-success {
      color: #10b981 !important;
    }

    .epitychia-error {
      color: #ef4444 !important;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize content script
console.log('Epitychia: Content script loaded on', window.location.hostname);

// Inject styles immediately
injectStyles();