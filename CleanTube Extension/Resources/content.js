class CleanTube {
  constructor() {
    this.styleId = 'cleantube-styles';
    this.settings = {};
    this.extensionEnabled = true;
    this.observer = null;
    this.debounceTimer = null;

    this.selectors = {
      // Sidebar Management
      'hide-entire-sidebar': [
        '#guide',
        'ytd-mini-guide-renderer',
        '#guide-content',
        'tp-yt-app-drawer#guide',
        '#guide-button'
      ],
      'hide-you-section': [
        '#guide ytd-guide-collapsible-section-entry-renderer',
        '#guide ytd-guide-entry-renderer:has(a[href*="/feed/history"])',
        '#guide ytd-guide-entry-renderer:has(a[href*="/playlist?list=WL"])',
        '#guide ytd-guide-entry-renderer:has(a[href*="/feed/library"])'
      ],
      'hide-subscriptions-section': [
        '#sections > ytd-guide-section-renderer:has(ytd-guide-collapsible-entry-renderer)',
        '#guide > ytd-guide-section-renderer:has(ytd-guide-collapsible-entry-renderer)',
        '#sections ytd-guide-collapsible-entry-renderer',
        '#guide ytd-guide-collapsible-entry-renderer'
      ],
      'hide-explore-section': [
        'ytd-guide-section-renderer:has(a[href^="/feed/trending"])',
        'ytd-guide-section-renderer:has(a[href="/gaming"])',
        'ytd-mini-guide-entry-renderer:has(a[href="/explore"])'
      ],
      'hide-more-from-youtube': [
        'ytd-guide-section-renderer:has(a[href*="youtubekids.com"])'
      ],
      'hide-sidebar-footer': [
        '#guide ytd-guide-entry-renderer:has(a[href*="/account"])',
        '#guide ytd-guide-entry-renderer:has(a[href*="/reporthistory"])',
      ],
      'hide-footer': [
        'ytd-browse-secondary-contents-renderer',
        '#footer'
      ],

      // Top Bar Elements
      'hide-burger-menu': [
        '#guide-button',
        'button#guide-button'
      ],
      'hide-youtube-logo': [
        '#logo',
        'ytd-topbar-logo-renderer'
      ],
      'hide-search-bar': [
        '#center.ytd-masthead',
        '#search-form',
        'ytd-searchbox'
      ],
      'hide-voice-search': [
        '#voice-search-button'
      ],
      'hide-search-filters': [
        '#chips-wrapper',
        'ytd-feed-filter-chip-bar-renderer'
      ],
      'hide-create-button': [
        '#create-icon',
        'button[aria-label*="Create"]'
      ],
      'hide-notifications': [
        '#notification-button',
        'button[aria-label*="Notifications"]'
      ],
      'hide-profile-menu': [
        '#avatar-btn',
        'button#avatar-btn'
      ],

      // Home Page Content
      'hide-recommendations': [
        'ytd-rich-grid-renderer #contents',
        'ytd-rich-item-renderer'
      ],
      'hide-trending': [
        'ytd-rich-shelf-renderer:has([title*="Trending"])'
      ],
      'hide-news': [
        'ytd-rich-shelf-renderer:has([title*="News"])'
      ],
      'hide-shorts': [
        'ytd-guide-entry-renderer:has(a[href="/shorts"])',
        'ytd-guide-entry-renderer:has([title="Shorts"])',
        `ytd-mini-guide-entry-renderer:has([aria-label*="Shorts"])`,
        // Shorts feed on homepage and other pages
        'ytd-rich-shelf-renderer:has([title*="Shorts"])',
        'ytd-reel-shelf-renderer',
        'ytd-rich-section-renderer:has([aria-label*="Shorts"])',
        // Individual shorts videos
        'ytd-video-renderer:has([aria-label*="Shorts"])',
        'ytd-rich-item-renderer:has([aria-label*="Shorts"])',
        // Shorts shelf containers
        '[is-shorts]',
        'ytd-rich-shelf-renderer[is-shorts]',
        // Additional shorts containers
        'ytd-reel-video-renderer',
        'ytd-shorts-lockup-view-model',
        // More comprehensive shorts selectors
        'ytd-rich-item-renderer:has([href*="/shorts/"])',
        'ytd-video-renderer:has([href*="/shorts/"])',
        // Shorts shelves in search and other pages  
        'ytd-shelf-renderer:has([title*="Shorts"])',
        'ytd-horizontal-card-list-renderer:has([title*="Shorts"])',
        // Shorts in notifications
        'ytd-notification-renderer:has([href*="/shorts/"])'
      ],

      // Video Page Elements
      'hide-related-videos': [
        '#secondary.ytd-watch-flexy'
      ],
      'hide-live-chat': [
        'ytd-live-chat-frame',
        '#chat-container'
      ],
      'hide-comments': [
        'ytd-comments',
        '#comments'
      ],
      'hide-video-suggestions': [
        '.ytp-ce-element',
        '.ytp-endscreen-content'
      ],
      'hide-video-description': [
        'ytd-video-secondary-info-renderer',
        '#description'
      ],

      // Video Interaction Buttons
      'hide-like-dislike': [
        'ytd-segmented-like-dislike-button-renderer',
        '#top-level-buttons-computed ytd-segmented-like-dislike-button-renderer',
        'like-button-view-model',
        'dislike-button-view-model',
        'segmented-like-dislike-button-view-model'
      ],
      'hide-share-button': [
        '#top-level-buttons-computed ytd-button-renderer:has([aria-label*="Share"])',
        'ytd-button-renderer:has([aria-label*="Share"])',
        'button[aria-label*="Share"]',
        '#top-level-buttons-computed [data-tooltip-target-id*="share"]'
      ],
      'hide-clip-button': [
        '#top-level-buttons-computed ytd-button-renderer:has([aria-label*="Clip"])',
        'ytd-button-renderer:has([aria-label*="Clip"])',
        'button[aria-label*="Clip"]',
        '#top-level-buttons-computed [data-tooltip-target-id*="clip"]'
      ],
      'hide-save-button': [
        '#top-level-buttons-computed ytd-button-renderer:has([aria-label*="Save"])',
        'ytd-button-renderer:has([aria-label*="Save"])',
        'button[aria-label*="Save"]',
        '#top-level-buttons-computed [data-tooltip-target-id*="save"]'
      ],
      'hide-more-actions': [
        '#top-level-buttons-computed ytd-button-renderer:has([aria-label*="More"])',
        'ytd-button-renderer:has([aria-label*="More"])',
        'button[aria-label*="More"]',
        '#top-level-buttons-computed ytd-menu-renderer'
      ],
      'hide-subscribe-button': [
        'ytd-subscribe-button-renderer',
        '#subscribe-button'
      ]
    };

    this.init();
  }

  async init() {
    try {
      await this.loadSettings();
      this.applyStyles();
      this.setupMessageListener();
      this.observeNavigation();
      console.log('CleanTube content script initialized');
    } catch (error) {
      console.error('CleanTube initialization error:', error);
    }
  }

  async loadSettings() {
    try {
      const keys = [...Object.keys(this.selectors), 'extensionEnabled'];
      const result = await browser.storage.sync.get(keys);

      this.settings = result;
      this.extensionEnabled = result.extensionEnabled !== false;
    } catch (error) {
      console.error('CleanTube: Error loading settings:', error);
      this.settings = {};
      this.extensionEnabled = true;
    }
  }

  generateCSS() {
    if (!this.extensionEnabled) {
      return '/* CleanTube - Extension Disabled */';
    }

    let css = '/* CleanTube - Active */\n';

    // Generate hiding rules efficiently
    Object.entries(this.settings).forEach(([setting, enabled]) => {
      if (enabled && this.selectors[setting]) {
        css += `${this.selectors[setting].join(', ')} { display: none !important; }\n`;
      }
    });

    // Layout optimizations
    if (this.settings['hide-entire-sidebar']) {
      css += `
ytd-app {
  --ytd-persistent-guide-width: 0px !important;
  --ytd-mini-guide-width: 0px !important;
}
`;
    }

    // Top bar layout fixes
    const hasTopBarChanges = [
      'hide-burger-menu',
      'hide-youtube-logo',
      'hide-create-button',
      'hide-notifications',
      'hide-profile-menu'
    ].some(key => this.settings[key]);

    if (hasTopBarChanges) {
      css += `
#container.ytd-masthead { 
  display: flex !important; 
  align-items: center !important; 
}
#center.ytd-masthead { 
  flex: 1 !important; 
  max-width: 728px !important; 
  margin: 0 40px !important; 
}
#search-form.ytd-masthead, ytd-searchbox { 
  max-width: 540px !important; 
  width: 540px !important; 
}
`;
    }

    css += `
body.cleantube-active * { 
  transition: opacity 0.2s ease !important; 
}
`;

    return css;
  }

  applyStyles() {
    // Remove existing styles
    const existingStyle = document.getElementById(this.styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Apply new styles
    const style = document.createElement('style');
    style.id = this.styleId;
    style.textContent = this.generateCSS();

    (document.head || document.documentElement).appendChild(style);

    // Add/remove body class based on extension state
    document.body.classList.toggle('cleantube-active', this.extensionEnabled);
  }

  setupMessageListener() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'updateSettings') {
        this.settings = message.settings || {};
        this.extensionEnabled = message.extensionEnabled !== false;

        // Debounce style application for better performance
        this.debounceStyleUpdate();

        sendResponse({ success: true });
      }
    });
  }

  debounceStyleUpdate() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.applyStyles();
    }, 100);
  }

  observeNavigation() {
    let lastUrl = location.href;

    // Clean up existing observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Optimized mutation observer with throttling
    this.observer = new MutationObserver((mutations) => {
      // Check if URL changed (YouTube SPA navigation)
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        this.debounceStyleUpdate();
        return;
      }

      // Only react to significant DOM changes
      const hasSignificantChanges = mutations.some(mutation =>
        mutation.type === 'childList' &&
        mutation.addedNodes.length > 0 &&
        Array.from(mutation.addedNodes).some(node =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node.tagName?.startsWith('YTD-') || node.id || node.className)
        )
      );

      if (hasSignificantChanges) {
        this.debounceStyleUpdate();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false, // Reduce observation scope for better performance
      characterData: false
    });

    // Handle browser navigation
    window.addEventListener('popstate', this.debounceStyleUpdate.bind(this));
  }

  // Cleanup method for memory management
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    const style = document.getElementById(this.styleId);
    if (style) {
      style.remove();
    }

    document.body.classList.remove('cleantube-active');

    window.removeEventListener('popstate', this.debounceStyleUpdate.bind(this));
  }
}

// Initialize extension with proper error handling
let cleanTubeInstance = null;

function initializeCleanTube() {
  try {
    if (cleanTubeInstance) {
      cleanTubeInstance.destroy();
    }
    cleanTubeInstance = new CleanTube();
  } catch (error) {
    console.error('Failed to initialize CleanTube:', error);
  }
}

// Robust initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCleanTube);
} else {
  initializeCleanTube();
}

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
  if (cleanTubeInstance) {
    cleanTubeInstance.destroy();
  }
});

