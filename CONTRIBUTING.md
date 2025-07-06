# Contributing to CalmTube

Thank you for your interest in contributing to CalmTube! This guide will help you add new features, fix bugs, and improve the extension.

## Ways to Contribute

- **Report bugs** when elements don't hide properly
- **Suggest new features** for hiding YouTube elements
- **Add new element filters**
- **Test across different YouTube layouts**
- **Improve documentation**

## Adding New Element Filters

### Step 1: Find the Element

1. **Right-click** on the YouTube element you want to hide
2. **Select "Inspect Element"** 
3. **Right-click** on the highlighted HTML in the inspector
4. **Choose "Copy → Selector"** to get the CSS selector

### Step 2: Test Your Selector

Test in Safari's console before adding to the extension:

```javascript
// Test if your selector finds the right elements
document.querySelectorAll('your-css-selector-here').length

// Temporarily hide elements to verify
document.querySelectorAll('your-selector').forEach(el => el.style.display = 'none')

// Show them again
document.querySelectorAll('your-selector').forEach(el => el.style.display = '')
```

### Step 3: Add to Extension

**1. Update Content Script** (`CalmTube Extension/Resources/content.js`)

Add your selector to the `this.selectors` object:

```javascript
this.selectors = {
    // ... existing selectors ...
    
    'your-new-filter': [
        'primary-css-selector',        // Most specific
        'fallback-selector',           // Alternative
        'general-selector'             // Broad fallback
    ]
};
```

**2. Add UI Control** (`CalmTube Extension/Resources/popup.html`)

Add a checkbox in the appropriate section:

```html
<label class="option">
    <input type="checkbox" id="your-new-filter">
    <span>Your Filter Description</span>
</label>
```

**3. Update JavaScript Arrays**

In `popup.js`:
```javascript
this.options = [
    // ... existing options ...
    'your-new-filter'
];
```

In `background.js`:
```javascript
const defaultSettings = {
    // ... existing settings ...
    'your-new-filter': false
};

const keys = [
    // ... existing keys ...
    'your-new-filter'
];
```

## Selector Best Practices

### Good Selectors
```css
/* Use YouTube's component structure */
ytd-guide-entry-renderer:has([title="Shorts"])

/* Target by function, not style */
#subscribe-button
ytd-subscribe-button-renderer

/* Use semantic attributes */
[aria-label*="Subscribe"]
[title="Trending"]
```

### Avoid These
```css
/* Fragile class names */
.style-scope.ytd-app.some-generated-class

/* Position-dependent selectors */
div:nth-child(5) > span:first-child
```

### Multiple Fallback Selectors

Try to provide multiple selectors for resilience:

```javascript
'hide-element': [
    'new-selector',           // Latest working selector
    'previous-selector',      // Fallback for older YouTube  
    'legacy-selector'         // Deep fallback
]
```

## Testing

Test your changes on these YouTube pages:
- Homepage (`youtube.com`)
- Video page (`youtube.com/watch?v=...`)
- Channel page (`youtube.com/@channel`)
- Search results (`youtube.com/results?search_query=...`)

Verify:
- ✅ Element hides correctly
- ✅ No layout breaks
- ✅ Works with existing filters
- ✅ No console errors

## Submitting Changes

### Pull Request Process
1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b add-new-filter`
3. **Make your changes** following the guidelines above
4. **Test thoroughly** across different YouTube pages
5. **Create a pull request** with:
   - Clear description of what the filter does
   - Screenshots showing before/after
   - List of tested scenarios

### Commit Message Format
```
Add filter for [element description]

- Hides [specific element] from [YouTube page]
- Uses stable selectors: [list main selectors]
- Tested on: [list test scenarios]
- Fixes: #issue-number (if applicable)
```

## Reporting Bugs

When reporting bugs, please include:

- **Element not hiding**: [Element name]
- **YouTube page**: [Homepage/Video/Channel/etc.]
- **Browser**: Safari [version]
- **macOS**: [version] 
- **Steps to reproduce**
- **Screenshots** (if helpful)

## YouTube Updates

YouTube frequently changes their interface, breaking filters. When this happens:

1. **Find new selectors** using dev tools
2. **Add new selectors** to existing arrays (don't replace)
3. **Test thoroughly**
4. **Submit as hotfix** if many filters are broken

## Development Setup

```bash
git clone https://github.com/maxoliinyk/calmtube
cd calmtube
open CalmTube.xcodeproj
```

**Requirements:**
- **Xcode**
- **macOS 12.3+** (Monterey or newer) 
- **Safari 15.4+** (for CSS `:has()` selector support)

## Getting Help

- **Questions**: [GitHub Discussions](https://github.com/maxoliinyk/calmtube/discussions)
- **Real-time help**: [Create an issue](https://github.com/maxoliinyk/calmtube/issues)

--- 