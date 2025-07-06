// CalmTube Popup Script
class CalmTubePopup {
  constructor() {
    this.options = [
      // Sidebar options
      'hide-entire-sidebar', 'hide-you-section', 'hide-subscriptions-section',
      'hide-explore-section', 'hide-more-from-youtube', 'hide-sidebar-footer', 'hide-footer',

      // Top bar options
      'hide-burger-menu', 'hide-youtube-logo', 'hide-search-bar', 'hide-voice-search',
      'hide-search-filters', 'hide-create-button', 'hide-notifications', 'hide-profile-menu',

      // Home page content
      'hide-recommendations', 'hide-shorts', 'hide-trending', 'hide-news',

      // Video page elements
      'hide-related-videos', 'hide-live-chat', 'hide-comments', 'hide-video-suggestions', 'hide-video-description',

      // Video interaction buttons
      'hide-like-dislike', 'hide-share-button', 'hide-clip-button', 'hide-save-button', 'hide-more-actions', 'hide-subscribe-button'
    ];

    this.minimalModeOptions = [
      'hide-entire-sidebar', 'hide-burger-menu', 'hide-youtube-logo', 'hide-create-button',
      'hide-notifications', 'hide-profile-menu', 'hide-search-filters', 'hide-related-videos',
      'hide-comments', 'hide-video-suggestions', 'hide-share-button', 'hide-clip-button',
      'hide-more-actions', 'hide-live-chat', 'hide-voice-search'
    ];

    this.currentSettings = {};
    this.extensionEnabled = true;
    this.activeTab = 'sidebar';

    this.init();
  }

  async init() {
    try {
      await this.loadSettings();
      this.setupUI();
      this.setupEventListeners();
      console.log('CalmTube popup initialized');
    } catch (error) {
      console.error('Error initializing popup:', error);
    }
  }

  async loadSettings() {
    try {
      const result = await browser.storage.sync.get([...this.options, 'extensionEnabled']);

      this.options.forEach(option => {
        const checkbox = document.getElementById(option);
        if (checkbox) {
          checkbox.checked = result[option] || false;
          this.currentSettings[option] = result[option] || false;
        }
      });

      this.extensionEnabled = result.extensionEnabled !== false;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  setupUI() {
    this.updateMinimalModeButton();
    this.updateExtensionToggle();
    this.showTab(this.activeTab);
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.showTab(tab);
      });
    });

    // Extension toggle
    const extensionToggle = document.getElementById('extension-toggle');
    if (extensionToggle) {
      extensionToggle.addEventListener('click', () => this.toggleExtension());
    }

    // Option checkboxes
    this.options.forEach(option => {
      const checkbox = document.getElementById(option);
      if (checkbox) {
        checkbox.addEventListener('change', () => this.handleOptionChange(option, checkbox.checked));
      }
    });

    // Minimal mode button
    const minimalBtn = document.getElementById('minimal-mode-btn');
    if (minimalBtn) {
      minimalBtn.addEventListener('click', () => this.toggleMinimalMode());
    }

    // Reset button and modal
    const resetBtn = document.getElementById('reset-all');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.showResetModal());
    }

    const cancelBtn = document.getElementById('cancel-reset');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideResetModal());
    }

    const confirmBtn = document.getElementById('confirm-reset');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.confirmReset());
    }

    // Close modal on backdrop click
    const modal = document.getElementById('reset-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.hideResetModal();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideResetModal();
    });
  }

  showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}-panel`);
    });

    this.activeTab = tabName;
  }

  async toggleExtension() {
    try {
      this.extensionEnabled = !this.extensionEnabled;
      await browser.storage.sync.set({ extensionEnabled: this.extensionEnabled });

      this.updateExtensionToggle();
      await this.applySettingsToCurrentTab();
    } catch (error) {
      console.error('Error toggling extension:', error);
    }
  }

  updateExtensionToggle() {
    const toggleBtn = document.getElementById('extension-toggle');
    if (toggleBtn) {
      toggleBtn.classList.toggle('disabled', !this.extensionEnabled);

      const statusText = toggleBtn.querySelector('.status-text');
      if (statusText) {
        statusText.textContent = this.extensionEnabled ? 'Enabled' : 'Disabled';
      }
    }
  }

  async handleOptionChange(option, checked) {
    try {
      this.currentSettings[option] = checked;

      // Auto-enable search filters hiding when recommendations are hidden
      if (option === 'hide-recommendations' && checked) {
        const searchFiltersCheckbox = document.getElementById('hide-search-filters');
        if (searchFiltersCheckbox && !searchFiltersCheckbox.checked) {
          searchFiltersCheckbox.checked = true;
          this.currentSettings['hide-search-filters'] = true;
        }
      }

      await this.saveSettings();
      this.updateMinimalModeButton();
    } catch (error) {
      console.error('Error handling option change:', error);
    }
  }

  async saveSettings() {
    try {
      await browser.storage.sync.set(this.currentSettings);
      await this.applySettingsToCurrentTab();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async applySettingsToCurrentTab() {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });

      if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
        await browser.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: this.currentSettings,
          extensionEnabled: this.extensionEnabled
        });
      }
    } catch (error) {
      console.error('Error applying settings to current tab:', error);
    }
  }

  async toggleMinimalMode() {
    try {
      const isMinimalActive = this.isMinimalModeActive();

      if (isMinimalActive) {
        // Disable minimal mode - restore previous settings
        await this.restorePreMinimalSettings();
      } else {
        // Enable minimal mode - store current settings and activate minimal
        await this.storePreMinimalSettings();
        this.activateMinimalMode();
      }

      await this.saveSettings();
      this.updateMinimalModeButton();
    } catch (error) {
      console.error('Error toggling minimal mode:', error);
    }
  }

  isMinimalModeActive() {
    return this.minimalModeOptions.every(option => this.currentSettings[option]);
  }

  async storePreMinimalSettings() {
    const preMinimalSettings = {};
    this.options.forEach(option => {
      preMinimalSettings[option] = this.currentSettings[option];
    });

    await browser.storage.sync.set({ preMinimalSettings });
  }

  async restorePreMinimalSettings() {
    try {
      const result = await browser.storage.sync.get('preMinimalSettings');

      if (result.preMinimalSettings) {
        this.options.forEach(option => {
          const value = result.preMinimalSettings[option] || false;
          this.currentSettings[option] = value;

          const checkbox = document.getElementById(option);
          if (checkbox) checkbox.checked = value;
        });
      }
    } catch (error) {
      console.error('Error restoring pre-minimal settings:', error);
    }
  }

  activateMinimalMode() {
    this.minimalModeOptions.forEach(option => {
      this.currentSettings[option] = true;
      const checkbox = document.getElementById(option);
      if (checkbox) checkbox.checked = true;
    });
  }

  updateMinimalModeButton() {
    const minimalBtn = document.getElementById('minimal-mode-btn');
    if (minimalBtn) {
      const isActive = this.isMinimalModeActive();
      minimalBtn.classList.toggle('active', isActive);

      const span = minimalBtn.querySelector('span');
      if (span) {
        span.textContent = isActive ? 'Exit Minimal' : 'Minimal';
      }
    }
  }

  showResetModal() {
    const modal = document.getElementById('reset-modal');
    if (modal) {
      modal.classList.add('show');
      document.getElementById('cancel-reset')?.focus();
    }
  }

  hideResetModal() {
    const modal = document.getElementById('reset-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  async confirmReset() {
    try {
      // Reset all settings to false
      const resetSettings = {};
      this.options.forEach(option => {
        resetSettings[option] = false;
        this.currentSettings[option] = false;

        const checkbox = document.getElementById(option);
        if (checkbox) checkbox.checked = false;
      });

      // Also reset extension state and remove pre-minimal settings
      resetSettings.extensionEnabled = true;
      this.extensionEnabled = true;

      await browser.storage.sync.set(resetSettings);
      await browser.storage.sync.remove('preMinimalSettings');

      this.updateUI();
      await this.applySettingsToCurrentTab();
      this.hideResetModal();
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }

  updateUI() {
    this.updateMinimalModeButton();
    this.updateExtensionToggle();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CalmTubePopup());
} else {
  new CalmTubePopup();
}
