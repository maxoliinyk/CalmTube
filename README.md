# CleanTube - Safari Extension for YouTube

A lightweight Safari extension that removes distracting elements from YouTube for a cleaner viewing experience.

## Features

**Sidebar Management**
- Hide entire sidebar, subscriptions, explore sections, or specific elements

**Top Bar Cleanup** 
- Remove YouTube logo, create button, notifications, profile menu, search bar

**Video Interactions**
- Hide like/dislike, share, clip, save, subscribe buttons

**Content Filtering**
- Remove recommendations, shorts feed, trending, news sections

**Video Page** 
- Clean video viewing by hiding related videos, comments, descriptions

**Ultra Minimal Mode**
- Transform YouTube into a distraction-free experience with one click

## Simple & Lightweight

- **Instant changes** - CSS injection applies immediately without page refresh
- **Memory efficient** - No DOM manipulation, just CSS rules
- **Works with YouTube navigation** - No page reloads needed

## Installation

### Option 1: App Store (Recommended)
*Coming soon - paid version with automatic updates*

### Option 2: Build Yourself (Free)
**Requirements:**
- **Xcode** (from Mac App Store)
- **macOS 12.3+** (Monterey or newer)
- **Safari 15.4+** (for CSS `:has()` selector support)
- **Safari Developer settings**: Safari → Preferences → Advanced → Show Develop menu → Allow Unsigned Extensions

**Steps:**
1. Clone this repository
2. Open `CleanTube.xcodeproj` in Xcode
3. Build and run the project
4. In Safari: Preferences → Extensions → Enable CleanTube Extension
5. Visit YouTube and click the CleanTube icon in the toolbar

## How to Use

1. Visit YouTube in Safari
2. Click the CleanTube icon in Safari's toolbar
3. Toggle options to hide distracting elements
4. Settings are saved automatically and persist across 
browser sessions

## Privacy

- **Zero data collection**
- **No network requests**  
- **No tracking or analytics**
Settings stored locally using Safari's secure storage

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on adding new filters, testing, and submitting changes.

## Support

- [Report bugs](https://github.com/maxoliinyk/cleantube/issues)
- [Request features](https://github.com/maxoliinyk/cleantube/discussions)

## Support Development

If CleanTube makes your YouTube experience better, 
consider:
- Starring this repository
- Sharing with friends who hate YouTube clutter
- Reporting bugs and suggesting features
- Contributing code improvements

## Known Issues

- The "Hide More from YouTube" option may also hide main sidebar buttons like Home, Subscriptions, Shorts, and YouTube Music.

---

Made for a cleaner YouTube experience.

CleanTube is not affiliated with YouTube or Google. YouTube is a trademark of Google Inc. 