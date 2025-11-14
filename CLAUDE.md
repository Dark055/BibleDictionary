# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### CSS Development
```bash
npm run build:css   # Build TailwindCSS styles once
npm run watch:css   # Watch for changes and rebuild automatically
```

### Local Development Servers
```bash
npm start           # Static file server with live-server (port 8080)
npm run serve       # Express server (uses server/server.js)
npm run serve:dev   # Express server with nodemon auto-reload
npm run dev         # Cloudflare Pages dev with KV emulation
```

### Deployment
```bash
npm run deploy      # Build CSS and deploy to Cloudflare Pages
```

## Architecture Overview

### Multi-Page Application Structure
This is a vanilla JavaScript multi-page application (MPA) with ES6 modules, deployed to Cloudflare Pages/Workers edge network. There is no bundler or framework - ES6 modules run natively in browsers.

**Main Pages:**
- `index.html` + `js/pages/home.js` - Landing page
- `read.html` + `js/pages/read.js` - Bible reading interface

### Component Architecture
UI components are ES6 classes located in `js/components/`:
- `BibleReader.js` - Verse rendering with word selection
- `Navigation.js` / `MobileNavigation.js` - Chapter/book navigation
- `TranslationSelector.js` - Translation switcher (adaptive: desktop dropdown, mobile compact)
- `WordTooltip.js` - AI-powered word definitions with draggable modal
- `Search.js` - Full-text Bible search with highlighting
- `CacheManager.js` - Cache management UI

Components follow this pattern:
```javascript
export class ComponentName {
  constructor(container, data, options) {
    this.container = container;
    this.render();
    this.attachEvents();
  }
  render() { /* DOM manipulation */ }
  attachEvents() { /* Event listeners */ }
  destroy() { /* Cleanup */ }
}
```

### Data Layer Architecture

**Services:**
- `bible-service.js` - Data abstraction layer with caching (localStorage, 7-day TTL)
- `bolls-api.js` - External Bible API client (Bolls.life API)
- `api-client.js` - Internal API client for word definitions and search

**Data Flow:**
```
User Action → Page Controller → bible-service.js → Cache Check (localStorage)
                                                  ↓ (if miss)
                                            bolls-api.js → External API
                                                  ↓
                                            Cache Update → Component Render
```

**Caching Strategy:**
- Chapter data: `localStorage` with 7-day TTL, keyed by translation
- Word definitions: `sessionStorage` (client) / Cloudflare KV (edge worker)
- Translation preference: `localStorage` + URL parameters

### State Management
State is stored in URL parameters for shareability:
- `?book=1&chapter=1&translation=NRT#v5` - Book, chapter, translation, verse
- No React/Vue state - URL is the source of truth
- `js/utils.js` handles URL parameter parsing and manipulation

### Deployment Model
**Dual deployment support:**
1. **Cloudflare Pages/Workers** (primary production):
   - Edge computing with KV storage
   - `worker.js` - Cloudflare Worker edge function
   - `wrangler.toml` - Cloudflare configuration
   - KV namespace binding: `WORDS_KV` for word definition cache

2. **Express Server** (local dev/alternative):
   - `server/server.js` - Express app with CORS
   - Routes: `server/routes/word.js`, `server/routes/search.js`
   - AI integrations: `server/lib/gemini.js`, `server/lib/openrouter.js`

### Bible Data Sources
The app uses **Bolls.life API** (https://bolls.life) for Bible content - no local JSON files.

**Supported Translations:**
- `UBIO` - Ukrainian Bible
- `NRT` - Russian New Translation (default)
- `NIV` - New International Version (English)

**API Endpoints:**
- `GET /get-text/{translation}/{book}/{chapter}/` - Fetch chapter
- `GET /get-books/{translation}/` - Fetch book list
- `GET /v2/find/{translation}?search=...` - Search text

### Shared Utilities
`shared/` directory contains code shared between client and worker:
- `bible-constants.js` - Bible books data, book aliases
- `bible-utils.js` - Bible reference parsing, text highlighting utilities

### Key Configuration Files
- `js/config.js` - App constants, Bible structure, translation configs
- `wrangler.toml` - Cloudflare Workers/Pages configuration (KV bindings)
- `tailwind.config.js` - TailwindCSS configuration (scans `*.html` and `js/**/*.js`)

## Important Patterns & Conventions

### Naming Conventions
- Files: `kebab-case.js`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Mobile-First Design
- Touch-optimized interactions (double-tap word selection, draggable modals)
- `min-w-[44px] min-h-[44px]` touch targets (iOS guideline)
- `touch-manipulation` CSS for smooth gestures
- Responsive components adapt to screen size (e.g., TranslationSelector)

### Offline-First with Caching
- Chapters auto-cache to localStorage for 7 days
- Cache expiry checks on every load
- Graceful degradation when API unavailable
- CacheManager component provides cache statistics and cleanup

### AI-Powered Word Analysis
- `WordTooltip` component integrates with AI API for etymological analysis
- Displays word definitions with complexity levels (basic/intermediate)
- Shows Greek/Hebrew original language information
- Results cached in sessionStorage (client) or KV (worker)

### URL-Based Navigation
- URL parameters enable shareable Bible references
- `js/utils.js` exports `getUrlParams()` and `setUrlParam()` helpers
- Hash routing for verses: `#v5` scrolls to verse 5
- Translation parameter: `?translation=NIV`

## Working with This Codebase

### Adding a New Component
1. Create ES6 class in `js/components/YourComponent.js`
2. Export the class with `export class YourComponent { ... }`
3. Import in page controller: `import { YourComponent } from '../components/YourComponent.js'`
4. Instantiate: `new YourComponent(container, data, options)`
5. Follow the constructor → render → attachEvents pattern

### Modifying Bible Display Logic
- `js/components/BibleReader.js` - Handles verse rendering and word selection
- `js/bible-service.js` - Handles fetching and caching chapter data
- `js/bolls-api.js` - Modify API calls to Bolls.life

### Adding a New Translation
1. Update `js/config.js` - Add to `TRANSLATIONS` object
2. Ensure Bolls.life API supports the translation code
3. Update `TranslationSelector` component if needed (auto-detects from config)

### Working with Cloudflare Workers
- `worker.js` contains the edge function logic
- Access KV with `env.WORDS_KV.get(key)` / `.put(key, value)`
- Test locally: `npm run dev` (requires wrangler CLI)
- Deploy: `npm run deploy` (builds CSS, deploys to Cloudflare)

### Debugging Cache Issues
- Use `CacheManager` component UI (available in settings)
- Check browser localStorage/sessionStorage in DevTools
- Cache keys format: `bible-chapter-${translation}-${bookNum}-${chapterNum}`
- Cache entries include `timestamp` and `expiresAt` fields

### Testing Changes
- Use `npm start` for quick static file serving
- Use `npm run serve:dev` for Express server with auto-reload
- Use `npm run dev` for full Cloudflare Workers emulation with KV
- Always test on mobile viewport (responsive design is critical)

## Notes
- Settings page (`settings.html`) was recently deleted - references may still exist in code
- The app migrated from local JSON files to Bolls.life API (no local `bible.json`)
- AI features require API keys (OpenRouter or Google Gemini) configured in environment
- Cloudflare KV namespace ID may need updating in `wrangler.toml` for new deployments
