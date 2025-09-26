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

// Initialize content script
console.log('Epitychia: Content script loaded on', window.location.hostname);