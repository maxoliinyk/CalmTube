// CalmTube Background Script
class CalmTubeBackground {
  constructor() {
    this.defaultSettings = {
      // Sidebar options
      'hide-entire-sidebar': false, 'hide-you-section': false, 'hide-subscriptions-section': false,
      'hide-explore-section': false, 'hide-more-from-youtube': false, 'hide-sidebar-footer': false, 'hide-footer': false,

      // Top bar options
      'hide-entire-topbar': false, 'hide-burger-menu': false, 'hide-youtube-logo': false, 'hide-search-bar': false, 'hide-voice-search': false,
      'hide-search-filters': false, 'hide-create-button': false, 'hide-notifications': false, 'hide-profile-menu': false,

      // Home page content
      'hide-recommendations': false, 'hide-shorts': false, 'hide-trending': false, 'hide-news': false,

      // Video page elements
      'hide-related-videos': false, 'hide-live-chat': false, 'hide-comments': false,
      'hide-video-suggestions': false, 'hide-video-description': false,

      // Video interaction buttons
      'hide-like-dislike': false, 'hide-share-button': false, 'hide-clip-button': false,
      'hide-save-button': false, 'hide-more-actions': false, 'hide-subscribe-button': false,

      // Extension state
      'extensionEnabled': true
    };

    this.init();
  }

  init() {
    this.setupInstallListener();
    this.setupMessageListener();
    this.setupTabUpdateListener();
    console.log('CalmTube background script initialized');
  }

  setupInstallListener() {
    browser.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        console.log('CalmTube extension installed');
        this.setDefaultSettings();
      } else if (details.reason === 'update') {
        console.log('CalmTube extension updated');
        this.updateExistingSettings();
      }
    });
  }

  setupMessageListener() {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Background received message:', request);

      switch (request.action) {
        case 'getSettings':
          this.getSettings().then(sendResponse);
          return true;

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
      // Apply settings when YouTube tab is loaded
      if (changeInfo.status === 'complete' &&
        tab.url &&
        tab.url.includes('youtube.com')) {

        // Delay to ensure content script is ready
        setTimeout(() => {
          this.applySettingsToTab(tabId);
        }, 1000);
      }
    });
  }

  async setDefaultSettings() {
    try {
      await browser.storage.sync.set(this.defaultSettings);
      console.log('Default settings applied');
    } catch (error) {
      console.error('Error setting default settings:', error);
    }
  }

  async updateExistingSettings() {
    try {
      // Ensure extensionEnabled exists for existing installations
      const result = await browser.storage.sync.get('extensionEnabled');
      if (result.extensionEnabled === undefined) {
        await browser.storage.sync.set({ extensionEnabled: true });
        console.log('Added extensionEnabled setting to existing installation');
      }
    } catch (error) {
      console.error('Error updating existing settings:', error);
    }
  }

  async getSettings() {
    try {
      const keys = Object.keys(this.defaultSettings);
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
          settings: result.settings,
          extensionEnabled: result.settings.extensionEnabled !== false
        });
      }
    } catch (error) {
      // Content script might not be ready yet
      console.log('Content script not ready for tab:', tabId);
    }
  }
}

// Initialize background script
new CalmTubeBackground();
