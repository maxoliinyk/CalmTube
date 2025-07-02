// CleanTube Background Script
class CleanTubeBackground {
  constructor() {
    this.init();
  }

  init() {
    this.setupInstallListener();
    this.setupMessageListener();
    this.setupTabUpdateListener();
    console.log('CleanTube background script initialized');
  }

  setupInstallListener() {
    browser.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        console.log('CleanTube extension installed');
        this.setDefaultSettings();
      } else if (details.reason === 'update') {
        console.log('CleanTube extension updated');
      }
    });
  }

  setupMessageListener() {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Background received message:', request);

      switch (request.action) {
        case 'getSettings':
          this.getSettings().then(sendResponse);
          return true; // Indicates async response

        case 'saveSettings':
          this.saveSettings(request.settings).then(sendResponse);
          return true;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    });
  }

  setupTabUpdateListener() {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      // When a YouTube tab is loaded/updated, ensure content script is ready
      if (changeInfo.status === 'complete' &&
        tab.url &&
        tab.url.includes('youtube.com')) {

        // Small delay to ensure content script is loaded
        setTimeout(() => {
          this.applySettingsToTab(tabId);
        }, 1000);
      }
    });
  }

  async setDefaultSettings() {
    const defaultSettings = {
      // Sidebar options
      'hide-entire-sidebar': false,
      'hide-shorts': false,
      'hide-you-section': false,
      'hide-subscriptions-section': false,
      'hide-explore-section': false,
      'hide-more-from-youtube': false,
      'hide-sidebar-footer': false,
      'hide-footer': false,

      // Top bar options
      'hide-burger-menu': false,
      'hide-youtube-logo': false,
      'hide-search-bar': false,
      'hide-search-filters': false,
      'hide-create-button': false,
      'hide-notifications': false,
      'hide-profile-menu': false,

      // Home page content
      'hide-recommendations': false,
      'hide-trending': false,
      'hide-news': false,

      // Video page elements
      'hide-related-videos': false,
      'hide-comments': false,
      'hide-video-suggestions': false,
      'hide-video-description': false,

      // Video interaction buttons
      'hide-like-dislike': false,
      'hide-share-button': false,
      'hide-clip-button': false,
      'hide-save-button': false,
      'hide-more-actions': false,
      'hide-subscribe-button': false,

      // Miscellaneous
      'hide-voice-search': false,
      'hide-live-chat': false,
      'ultra-clean-mode': false
    };

    try {
      await browser.storage.sync.set(defaultSettings);
      console.log('Default settings applied');
    } catch (error) {
      console.error('Error setting default settings:', error);
    }
  }

  async getSettings() {
    try {
      const keys = [
        // Sidebar options
        'hide-entire-sidebar', 'hide-shorts', 'hide-you-section', 'hide-subscriptions-section',
        'hide-explore-section', 'hide-more-from-youtube', 'hide-sidebar-footer', 'hide-footer',

        // Top bar options
        'hide-burger-menu', 'hide-youtube-logo', 'hide-search-bar', 'hide-search-filters',
        'hide-create-button', 'hide-notifications', 'hide-profile-menu',

        // Home page content
        'hide-recommendations', 'hide-trending', 'hide-news',

        // Video page elements
        'hide-related-videos', 'hide-comments', 'hide-video-suggestions', 'hide-video-description',

        // Video interaction buttons
        'hide-like-dislike', 'hide-share-button', 'hide-clip-button',
        'hide-save-button', 'hide-more-actions', 'hide-subscribe-button',

        // Miscellaneous
        'hide-voice-search', 'hide-live-chat', 'ultra-clean-mode'
      ];

      const settings = await browser.storage.sync.get(keys);
      return { success: true, settings };
    } catch (error) {
      console.error('Error getting settings:', error);
      return { success: false, error: error.message };
    }
  }

  async saveSettings(settings) {
    try {
      await browser.storage.sync.set(settings);
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: error.message };
    }
  }

  async applySettingsToTab(tabId) {
    try {
      const result = await this.getSettings();
      if (result.success) {
        await browser.tabs.sendMessage(tabId, {
          action: 'updateSettings',
          settings: result.settings
        });
      }
    } catch (error) {
      // Content script might not be ready yet, which is fine
      console.log('Content script not ready for tab:', tabId);
    }
  }
}

// Initialize background script
new CleanTubeBackground();
