// CleanTube Popup Script
class CleanTubePopup {
  constructor() {
    this.options = [
      // Sidebar options
      'hide-entire-sidebar',
      'hide-shorts',
      'hide-you-section',
      'hide-subscriptions-section',
      'hide-explore-section',
      'hide-more-from-youtube',
      'hide-sidebar-footer',
      'hide-footer',

      // Top bar options
      'hide-burger-menu',
      'hide-youtube-logo',
      'hide-search-bar',
      'hide-search-filters',
      'hide-create-button',
      'hide-notifications',
      'hide-profile-menu',

      // Home page content
      'hide-recommendations',
      'hide-trending',
      'hide-news',

      // Video page elements
      'hide-related-videos',
      'hide-comments',
      'hide-video-suggestions',
      'hide-video-description',

      // Video interaction buttons
      'hide-like-dislike',
      'hide-share-button',
      'hide-clip-button',
      'hide-save-button',
      'hide-more-actions',
      'hide-subscribe-button',

      // Miscellaneous
      'hide-voice-search',
      'hide-live-chat',
      'ultra-clean-mode'
    ];

    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.restoreScrollPosition();
    console.log('CleanTube popup initialized');
  }

  async loadSettings() {
    try {
      const result = await browser.storage.sync.get(this.options);

      this.options.forEach(option => {
        const checkbox = document.getElementById(option);
        if (checkbox) {
          checkbox.checked = result[option] || false;
        }
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      const settings = {};
      this.options.forEach(option => {
        const checkbox = document.getElementById(option);
        if (checkbox) {
          settings[option] = checkbox.checked;
        }
      });

      await browser.storage.sync.set(settings);
      await this.applySettingsToCurrentTab();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async applySettingsToCurrentTab() {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });

      if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
        const settings = {};
        this.options.forEach(option => {
          const checkbox = document.getElementById(option);
          if (checkbox) {
            settings[option] = checkbox.checked;
          }
        });

        await browser.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: settings
        });
      }
    } catch (error) {
      console.error('Error applying settings to current tab:', error);
    }
  }

  setupEventListeners() {
    // Individual checkbox listeners
    this.options.forEach(option => {
      const checkbox = document.getElementById(option);
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          // Auto-enable search filters hiding when recommendations are hidden
          if (option === 'hide-recommendations' && checkbox.checked) {
            const searchFiltersCheckbox = document.getElementById('hide-search-filters');
            if (searchFiltersCheckbox && !searchFiltersCheckbox.checked) {
              searchFiltersCheckbox.checked = true;
            }
          }

          this.saveSettings();
        });
      }
    });

    // Toggle All button
    const toggleAllBtn = document.getElementById('toggle-all');
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        this.toggleAll();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-all');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetAll();
      });
    }

    // Save scroll position when scrolling
    document.body.addEventListener('scroll', () => {
      this.saveScrollPosition();
    });

    // Save scroll position when popup is about to close
    window.addEventListener('beforeunload', () => {
      this.saveScrollPosition();
    });

    // Also save scroll position on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveScrollPosition();
      }
    });
  }

  saveScrollPosition() {
    try {
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      localStorage.setItem('cleantube-popup-scroll', scrollTop.toString());
    } catch (error) {
      console.error('Error saving scroll position:', error);
    }
  }

  restoreScrollPosition() {
    try {
      const savedScrollTop = localStorage.getItem('cleantube-popup-scroll');
      if (savedScrollTop) {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          const scrollTop = parseInt(savedScrollTop, 10);
          document.body.scrollTop = scrollTop;
          document.documentElement.scrollTop = scrollTop;
        }, 10);
      }
    } catch (error) {
      console.error('Error restoring scroll position:', error);
    }
  }

  toggleAll() {
    const checkboxes = this.options.map(option => document.getElementById(option));
    const allChecked = checkboxes.every(checkbox => checkbox && checkbox.checked);

    checkboxes.forEach(checkbox => {
      if (checkbox) {
        checkbox.checked = !allChecked;
      }
    });

    this.saveSettings();
  }

  async resetAll() {
    this.options.forEach(option => {
      const checkbox = document.getElementById(option);
      if (checkbox) {
        checkbox.checked = false;
      }
    });

    await this.saveSettings();
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CleanTubePopup();
  });
} else {
  new CleanTubePopup();
}
