// Extension popup script
document.addEventListener('DOMContentLoaded', function() {
  loadRecentItems();
  
  // Test popup button
  document.getElementById('test-popup').addEventListener('click', function() {
    // Send test message to current tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'CLIPBOARD_CHANGED',
        content: 'This is a test message to demonstrate the AI popup functionality. Click any transformation to see it in action!',
        timestamp: Date.now()
      });
    });
    
    // Close popup
    window.close();
  });
  
  // Open app button
  document.getElementById('open-app').addEventListener('click', function() {
    chrome.tabs.create({
      url: 'http://localhost:3000'
    });
    window.close();
  });
});

// Load recent clipboard items from storage
async function loadRecentItems() {
  try {
    const result = await chrome.storage.local.get(['lastClipboardContent', 'timestamp']);
    
    if (result.lastClipboardContent) {
      const recentItemsContainer = document.getElementById('recent-items');
      const timeAgo = getTimeAgo(result.timestamp);
      
      recentItemsContainer.innerHTML = `
        <div class="recent-item">
          ${result.lastClipboardContent.substring(0, 100)}${result.lastClipboardContent.length > 100 ? '...' : ''}
          <div class="recent-time">${timeAgo}</div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading recent items:', error);
  }
}

// Get human-readable time ago
function getTimeAgo(timestamp) {
  if (!timestamp) return 'Unknown time';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}