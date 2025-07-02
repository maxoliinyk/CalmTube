browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
  console.log("Received response: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received request: ", request);
});

// CleanTube Content Script - Lightweight YouTube Element Hider
class CleanTube {
  constructor() {
    this.styleId = 'cleantube-styles';
    this.settings = {};

    // Precise CSS selectors for different YouTube elements
    this.selectors = {
      // Sidebar Management
      'hide-entire-sidebar': [
        '#guide',
        'ytd-mini-guide-renderer',
        '#guide-content',
        'tp-yt-app-drawer#guide',
        '#guide-button',
        '#guide-icon'
      ],
      'hide-you-section': [
        // Target ONLY the collapsible "You" section container
        '#guide #items > ytd-guide-collapsible-section-entry-renderer',
        '#guide ytd-guide-collapsible-section-entry-renderer',
        // Target individual "You" section items directly (safer)
        '#guide ytd-guide-entry-renderer:has(a[href="/feed/history"])',
        '#guide ytd-guide-entry-renderer:has(a[href="/playlist?list=WL"])',
        '#guide ytd-guide-entry-renderer:has(a[href="/feed/library"])',
        '#guide ytd-guide-entry-renderer:has(a[href="/feed/downloads"])',
        '#guide ytd-guide-entry-renderer:has([title="History"])',
        '#guide ytd-guide-entry-renderer:has([title="Watch Later"])',
        '#guide ytd-guide-entry-renderer:has([title="Liked videos"])',
        '#guide ytd-guide-entry-renderer:has([title="Your videos"])'
      ],
      'hide-subscriptions-section': [
        // Target the subscriptions section completely
        '#sections > ytd-guide-section-renderer:has(ytd-guide-collapsible-entry-renderer)',
        '#guide > ytd-guide-section-renderer:has(ytd-guide-collapsible-entry-renderer)',
        // Target the collapsible subscriptions container directly
        '#sections ytd-guide-collapsible-entry-renderer',
        '#guide ytd-guide-collapsible-entry-renderer'
      ],
      'hide-explore-section': [
        // Hide the entire "Explore" guide section (title + all items + divider)
        'ytd-guide-section-renderer:has(a[href^="/feed/trending"])',
        'ytd-guide-section-renderer:has(a[href="/gaming"])',
        'ytd-guide-section-renderer:has(a[href="/live"])',
        'ytd-mini-guide-entry-renderer:has(a[href="/explore"])',
        // Divider following the section
        'ytd-guide-section-renderer:has(a[href^="/feed/trending"]) + hr',
        'ytd-guide-section-renderer:has(a[href="/gaming"]) + hr'
      ],
      'hide-more-from-youtube': [
        /* Hide "More from YouTube" section*/
        'ytd-guide-section-renderer:has(a[href*="studio.youtube.com"])',
        'ytd-guide-section-renderer:has(a[href*="studio.youtube.com"]) + hr',

        /* Collapsed-sidebar (mini guide) icons for Studio / Kids / Premium / TV */
        'ytd-mini-guide-entry-renderer:has(a[href*="studio.youtube.com"])',
        'ytd-mini-guide-entry-renderer:has(a[href*="youtubekids.com"])',
        'ytd-mini-guide-entry-renderer:has(a[href*="youtube.com/premium"])',
        'ytd-mini-guide-entry-renderer:has(a[href*="tv.youtube.com"])'
      ],
      'hide-shorts': [
        // Shorts button in sidebar
        'ytd-guide-entry-renderer:has(a[href="/shorts"])',
        'ytd-guide-entry-renderer:has([title="Shorts"])',
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

      // Top Bar Elements
      'hide-burger-menu': [
        '#guide-button',
        'button#guide-button',
        'ytd-topbar-menu-button-renderer[aria-label*="Guide"]',
        'button[aria-label*="Guide"]'
      ],
      'hide-youtube-logo': [
        '#logo',
        'ytd-topbar-logo-renderer',
        '#masthead-logo',
        'a#logo'
      ],
      'hide-search-bar': [
        '#center.ytd-masthead',
        '#search-form',
        'ytd-searchbox'
      ],
      'hide-search-filters': [
        '#chips-wrapper',
        'ytd-feed-filter-chip-bar-renderer',
        'yt-chip-cloud-renderer'
      ],
      'hide-create-button': [
        '#create-icon',
        'ytd-topbar-menu-button-renderer[aria-label*="Create"]',
        'button[aria-label*="Create"]'
      ],
      'hide-notifications': [
        '#notification-button',
        'ytd-notification-topbar-button-renderer',
        'button[aria-label*="Notifications"]'
      ],
      'hide-profile-menu': [
        '#avatar-btn',
        'ytd-topbar-menu-button-renderer:has(button#avatar-btn)',
        'button#avatar-btn'
      ],

      // Home Page Content
      'hide-recommendations': [
        'ytd-rich-grid-renderer #contents',
        'ytd-rich-item-renderer',
        'ytd-video-renderer'
      ],
      'hide-trending': [
        'ytd-rich-shelf-renderer:has([title*="Trending"])',
        'ytd-rich-section-renderer:has([title*="Trending"])'
      ],
      'hide-news': [
        'ytd-rich-shelf-renderer:has([title*="News"])',
        'ytd-rich-shelf-renderer:has([title*="Breaking"])'
      ],

      // Video Page Elements
      'hide-related-videos': [
        '#secondary.ytd-watch-flexy'
      ],
      'hide-comments': [
        'ytd-comments',
        '#comments'
      ],
      'hide-video-suggestions': [
        '.ytp-ce-element',
        '.ytp-cards-teaser',
        '.ytp-endscreen-content'
      ],
      'hide-video-description': [
        'ytd-video-secondary-info-renderer',
        '#description'
      ],

      // Video Interaction Buttons - Modern selectors
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
        '#subscribe-button',
        'paper-button#subscribe-button'
      ],

      // Sidebar footer section  
      'hide-sidebar-footer': [
        // Target individual footer items directly (safer approach)
        '#guide ytd-guide-entry-renderer:has(a[href*="/account"])',
        '#guide ytd-guide-entry-renderer:has(a[href*="support.google.com"])',
        '#guide ytd-guide-entry-renderer:has(a[href*="feedback"])',
        '#guide ytd-guide-entry-renderer:has([title="Settings"])',
        '#guide ytd-guide-entry-renderer:has([title="Help"])',
        '#guide ytd-guide-entry-renderer:has([title="Send feedback"])',
        '#guide ytd-guide-entry-renderer:has([title="Report history"])',
        '#sections ytd-guide-entry-renderer:has(a[href*="/account"])',
        '#sections ytd-guide-entry-renderer:has(a[href*="support.google.com"])',
        '#sections ytd-guide-entry-renderer:has(a[href*="feedback"])',
        '#sections ytd-guide-entry-renderer:has([title="Settings"])',
        '#sections ytd-guide-entry-renderer:has([title="Help"])',
        '#sections ytd-guide-entry-renderer:has([title="Send feedback"])',
        '#sections ytd-guide-entry-renderer:has([title="Report history"])'
      ],
      'hide-footer': [
        'ytd-browse-secondary-contents-renderer',
        '#footer'
      ],

      // Miscellaneous
      'hide-voice-search': [
        '#voice-search-button',
        '.ytd-voice-search-button-renderer'
      ],
      'hide-live-chat': [
        'ytd-live-chat-frame',
        '#chat-container',
        '#chatframe',
        'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-live-chat"]'
      ],

      // Ultra clean mode - hide everything except search and main content
      'ultra-clean-mode': [
        // Hide entire sidebar
        '#guide',
        '#guide-button',
        '#guide-icon',
        'ytd-mini-guide-renderer',

        // Hide top bar elements except search
        '#logo',
        'ytd-topbar-logo-renderer',
        '#voice-search-button',
        '#notification-button',
        '#create-icon',
        '#avatar-btn',
        'ytd-topbar-menu-button-renderer',

        // Hide search filters
        '#chips-wrapper',
        'ytd-feed-filter-chip-bar-renderer',

        // Hide video page sidebar
        '#secondary.ytd-watch-flexy',

        // Hide comments
        'ytd-comments',
        '#comments',

        // Hide footer
        'ytd-browse-secondary-contents-renderer',
        '#footer'
      ]
    };

    this.init();
  }

  async init() {
    await this.loadSettings();
    this.applyStyles();
    this.setupMessageListener();
    this.observeNavigation();
    console.log('CleanTube content script initialized');
  }

  async loadSettings() {
    try {
      const options = Object.keys(this.selectors);
      const result = await browser.storage.sync.get(options);
      this.settings = result;
    } catch (error) {
      console.error('CleanTube: Error loading settings:', error);
      this.settings = {};
    }
  }

  generateCSS() {
    let css = '/* CleanTube - Generated Styles */\n';

    // Apply basic hiding rules
    Object.keys(this.settings).forEach(setting => {
      if (this.settings[setting] && this.selectors[setting]) {
        const selectors = this.selectors[setting];
        css += `/* ${setting} */\n`;
        css += `${selectors.join(',\n')} {\n`;
        css += '    display: none !important;\n';
        css += '}\n\n';
      }
    });

    // Fix layout when entire sidebar is hidden
    if (this.settings['hide-entire-sidebar']) {
      css += `
/* Fix layout when sidebar is hidden - Modern YouTube layout */
ytd-app {
    margin-left: 0 !important;
}

ytd-browse[page-subtype="home"] {
    margin-left: 0 !important;
}

ytd-watch-flexy:not([fullscreen]) {
    margin-left: 0 !important;
}

ytd-watch-flexy:not([fullscreen]) #primary.ytd-watch-flexy {
    margin-left: 0 !important;
    max-width: none !important;
}

#masthead-container {
    padding-left: 16px !important;
}

/* Center home page content properly */
ytd-two-column-browse-results-renderer {
    display: flex !important;
    justify-content: center !important;
    margin: 0 auto !important;
}

ytd-rich-grid-renderer {
    max-width: 1284px !important;
    margin: 0 auto !important;
}

#contents.ytd-rich-grid-renderer {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
    gap: 16px !important;
    justify-content: center !important;
    margin: 0 auto !important;
    padding: 0 24px !important;
}

/* Fix browse page layout */
ytd-browse {
    margin-left: 0 !important;
}

/* Ensure page container is centered */
ytd-page-manager {
    margin-left: 0 !important;
}
`;
    }

    // Fix top bar layout when elements are hidden - keep positions stable
    const hideTopElements = this.settings['hide-burger-menu'] ||
      this.settings['hide-youtube-logo'] ||
      this.settings['hide-create-button'] ||
      this.settings['hide-notifications'] ||
      this.settings['hide-profile-menu'];

    if (hideTopElements) {
      css += `
/* Keep search bar centered and maintain element positions */
#container.ytd-masthead {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    max-width: none !important;
}

#start.ytd-masthead {
    flex: 0 0 169px !important;
    display: flex !important;
    justify-content: flex-start !important;
    align-items: center !important;
}

#center.ytd-masthead {
    flex: 1 !important;
    max-width: 728px !important;
    margin: 0 40px !important;
    display: flex !important;
    justify-content: center !important;
}

#end.ytd-masthead {
    flex: 0 0 225px !important;
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
}

/* Maintain search form size */
#search-form.ytd-masthead {
    max-width: 540px !important;
    width: 540px !important;
}

/* Keep search container centered */
ytd-searchbox {
    max-width: 540px !important;
    width: 540px !important;
}
`;
    }

    // Fix layout when burger menu is hidden
    if (this.settings['hide-burger-menu']) {
      css += `
/* Adjust start section spacing when burger menu is hidden */
#start.ytd-masthead {
    padding-left: 16px !important;
}

/* Ensure logo positioning looks good without burger menu */
ytd-topbar-logo-renderer {
    margin-left: 0 !important;
}
`;
    }

    // Fix video layout when related videos are hidden
    if (this.settings['hide-related-videos']) {
      css += `
/* Fix video layout when related videos are hidden */
ytd-watch-flexy:not([fullscreen]) #primary.ytd-watch-flexy {
    max-width: 100% !important;
    margin: 0 auto !important;
}

ytd-watch-flexy[flexy] #primary.ytd-watch-flexy {
    flex: 1 !important;
    min-width: 0 !important;
}

ytd-watch-flexy:not([theater]) #primary.ytd-watch-flexy {
    max-width: 1280px !important;
    padding: 0 24px !important;
}
`;
    }

    // Ultra clean mode - truly minimal interface
    if (this.settings['ultra-clean-mode']) {
      css += `
/* Ultra clean mode - only search bar visible and content centered */

/* Hide all top bar elements except search */
#start.ytd-masthead {
    display: none !important;
}

#end.ytd-masthead {
    display: none !important;
}

/* Center search bar in masthead */
#container.ytd-masthead {
    justify-content: center !important;
    align-items: center !important;
    padding: 0 24px !important;
}

#center.ytd-masthead {
    flex: none !important;
    max-width: 540px !important;
    width: 540px !important;
    margin: 0 !important;
}

/* Remove sidebar completely */
ytd-app {
    margin-left: 0 !important;
}

ytd-browse {
    margin-left: 0 !important;
}

ytd-page-manager {
    margin-left: 0 !important;
}

/* Center home page content */
ytd-two-column-browse-results-renderer {
    display: flex !important;
    justify-content: center !important;
    margin: 0 auto !important;
    max-width: 1284px !important;
}

ytd-rich-grid-renderer {
    margin: 0 auto !important;
    max-width: 1284px !important;
}

#contents.ytd-rich-grid-renderer {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
    gap: 16px !important;
    justify-content: center !important;
    margin: 0 auto !important;
    padding: 0 24px !important;
}

/* Center video page content when in ultra clean mode */
ytd-watch-flexy:not([fullscreen]) {
    margin-left: 0 !important;
    max-width: 1284px !important;
    margin: 0 auto !important;
}

ytd-watch-flexy:not([fullscreen]) #primary.ytd-watch-flexy {
    margin-left: 0 !important;
    max-width: none !important;
}
`;
    }

    css += `
/* General improvements */
.cleantube-active {
    /* Extension is active */
}

/* Smooth transitions */
* {
    transition: opacity 0.2s ease !important;
}
`;

    return css;
  }

  applyStyles() {
    const existingStyle = document.getElementById(this.styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = this.styleId;
    style.textContent = this.generateCSS();

    (document.head || document.documentElement).appendChild(style);
    document.body.classList.add('cleantube-active');
  }

  setupMessageListener() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'updateSettings') {
        this.settings = message.settings;
        this.applyStyles();
        sendResponse({ success: true });
      }
    });
  }

  observeNavigation() {
    let lastUrl = location.href;

    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        // Small delay to ensure new content is loaded
        setTimeout(() => {
          this.applyStyles();
        }, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.applyStyles();
      }, 500);
    });
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CleanTube();
  });
} else {
  new CleanTube();
}

new CleanTube();

