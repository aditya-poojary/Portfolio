# My Portfolio

This is my personal portfolio website built to showcase what I've been working on. It's not just another portfolio — I put actual effort into making it smooth, responsive, and functional across all devices.

**Live Site:** [adityapoojary.dev](https://adityapoojary.dev)

---

## What's Inside

This portfolio includes all the important stuff:

- **About Me** — Who I am and what I do
- **Experience** — Professional work with companies I've worked with (includes project cards with tech stacks, GitHub links, and live demos)
- **Personal Projects** — Side projects I've built for fun or to solve specific problems
- **Tech Stack** — Technologies I actually use and am comfortable with
- **Problem Solving** — LeetCode/GitHub contribution graphs showing my coding consistency
- **Education** — Academic background
- **Achievements** — Certifications and recognitions worth mentioning
- **Contact** — Ways to reach me (social links, resume download)

---

## Tech Stack

Built with tools that actually matter:

### Frontend

- **Angular 20** — Full framework with SSR (Server-Side Rendering) for better SEO and performance
- **TypeScript** — Type-safe JavaScript because I don't like runtime errors
- **Tailwind CSS 4** — Utility-first CSS framework for rapid styling
- **GSAP (GreenSock)** — Smooth scroll animations with ScrollSmoother and ScrollTrigger plugins
- **Signals** — Angular's reactive state management (no more RxJS hell for simple state)

### Deployment & Automation

- **GitHub Actions** — Automated LeetCode data fetching (runs daily at midnight UTC)
- **GitHub Pages** — Static site hosting (free and fast)
- **Angular SSR** — Server-side rendering with Express.js for better initial load times

### Other Tools

- **NgOptimizedImage** — Lazy loading and optimized image delivery
- **Standalone Components** — Modern Angular architecture (no more NgModules)
- **Responsive Design** — Mobile-first approach with breakpoints for tablet and desktop

---

## Key Features

### 1. **Smooth Scrolling with GSAP**

I'm using GSAP's ScrollSmoother to make the whole page feel buttery smooth. It's not just a gimmick — it actually enhances the user experience. ScrollTrigger is used for section-based animations and active navbar highlighting.

### 2. **GitHub & LeetCode Contribution Graphs**

The "Problem Solving" section pulls real data from:

- **GitHub** — Shows my contribution activity over the years
- **LeetCode** — Fetched automatically via a GitHub Actions workflow that runs daily

The LeetCode data is stored in `public/data/leetcode.json` and gets updated every 24 hours without me having to lift a finger.

### 3. **Responsive Everywhere**

I spent way too much time making sure this works perfectly on:

- Mobile (< 420px)
- Tablet (420px - 1024px)
- Desktop (> 1024px)

The contribution graph even switches from horizontal (desktop) to vertical (mobile) layouts to fit the screen properly.

### 4. **Custom Branding**

My personal logo (`assets/images/logo.png`) is used for:

- Navbar branding
- Favicon
- Open Graph images (for social media previews)
- Apple touch icons

No more generic Angular logo showing up when someone shares my site.

### 5. **Experience Section with Horizontal Scrolling**

On desktop, the experience section uses GSAP to create a horizontal scrolling effect. It's like a timeline that moves sideways as you scroll down. Each company has its own "stripe" with project cards underneath.

On mobile/tablet, it switches to a normal vertical layout because horizontal scrolling on small screens is annoying.

### 6. **Splash Screen Loader**

When you first load the site, there's a quick splash screen with my initials "A D I" that:

- Displays horizontally on desktop/tablet
- Stacks vertically on mobile
- Slides up smoothly when done loading

It's subtle but adds a nice touch.

### 7. **Custom Cursor Follower**

On devices with a mouse (desktop), there's a custom cursor effect that follows your pointer. It's automatically hidden on touch devices so it doesn't show up in the corner on mobile.

---

## How It Works

### Build Process

This is an Angular 20 SSR application. When you build it:

```bash
npm run build
```

It generates:

- Client-side bundles (JavaScript, CSS)
- Server-side bundles (for Express.js)
- Prerendered HTML for better SEO

### LeetCode Data Automation

The `.github/workflows/heatmap_v2.yml` workflow:

1. Runs daily at midnight UTC (or manually via workflow dispatch)
2. Executes `scripts/leetcode.js`
3. Fetches my LeetCode profile data (ranking, streak, submissions)
4. Fetches contribution calendar for specified years
5. Saves everything to `public/data/leetcode.json`
6. Commits and pushes the updated JSON back to the repo

This means the portfolio always shows up-to-date LeetCode stats without manual intervention.

### GitHub Actions Setup

The workflow uses:

- **Node.js LTS** (`node-version: 'lts/*'`) — Future-proof and always uses the latest long-term support version
- **actions/checkout@v5** — Runs on Node.js 24 internally (required for compatibility)
- **actions/setup-node@v5** — Also runs on Node.js 24

This ensures the workflow won't break when GitHub deprecates older Node versions.

---

## Development

### Prerequisites

- Node.js 20+ (or latest LTS)
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/aditya-poojary/Portfolio.git
cd Portfolio

# Install dependencies
npm install
```

### Running Locally

```bash
# Development server (with hot reload)
npm start
# or
ng serve

# Open browser to http://localhost:4200/
```

### Building for Production

```bash
# Production build with SSR
npm run build

# Serve the built files
npm run serve:ssr:Portfolio
```

### Testing

```bash
# Run unit tests
npm test
```

---

## Project Structure

```
Portfolio/
├── .github/
│   └── workflows/
│       └── heatmap_v2.yml          # LeetCode data automation
├── public/
│   ├── data/
│   │   └── leetcode.json           # Auto-updated LeetCode data
│   └── assets/
│       └── images/                  # All images (logo, projects, etc.)
├── scripts/
│   └── leetcode.js                  # LeetCode API fetcher
├── src/
│   ├── app/
│   │   ├── components/              # All Angular components
│   │   │   ├── about-me/
│   │   │   ├── achievements/
│   │   │   ├── contributions-unified/  # GitHub + LeetCode graphs
│   │   │   ├── education/
│   │   │   ├── experience/
│   │   │   ├── navbar/
│   │   │   ├── personal-projects/
│   │   │   ├── problem-solving/
│   │   │   ├── splash-screen/
│   │   │   ├── tech-stack/
│   │   │   └── utilities/          # Reusable components
│   │   ├── services/                # Angular services
│   │   ├── app.config.ts            # App configuration
│   │   ├── app.routes.ts            # Routing configuration
│   │   └── app.ts                   # Root component with GSAP setup
│   ├── index.html                   # Main HTML file
│   ├── main.ts                      # Client-side entry point
│   ├── server.ts                    # SSR server entry point
│   └── styles.css                   # Global styles with Tailwind imports
├── angular.json                     # Angular CLI configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies and scripts
```

---

## Configuration Notes

### GSAP ScrollSmoother

GSAP is registered in `app.ts` (the root component):

```typescript
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

ScrollSmoother.create({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1.35, // Smoothness level
  smoothTouch: 0.2, // Less smooth on touch devices
  effects: true, // Enable data-speed effects
  normalizeScroll: true, // Better cross-browser compatibility
});
```

This is the only place where GSAP plugins are registered, and it's done globally so all components can use ScrollTrigger without re-registering.

### Image Optimization

All images use Angular's `NgOptimizedImage` directive for:

- Automatic lazy loading
- Responsive image sizing
- Proper aspect ratios
- Better Core Web Vitals scores

### Responsive Breakpoints

Tailwind breakpoints used throughout:

- `max-md:` — Mobile styles (< 768px)
- `md:` — Tablet styles (768px - 1024px)
- `lg:` — Desktop styles (> 1024px)

Custom breakpoints for contribution graph:

- Mobile: < 420px (vertical layout)
- Tablet/Desktop: >= 420px (horizontal layout)

---

## Performance Optimizations

1. **SSR (Server-Side Rendering)** — Initial page load is fast because HTML is pre-rendered
2. **Lazy Loading Images** — Images only load when they're about to enter the viewport
3. **Code Splitting** — Angular automatically splits code into chunks
4. **Tree Shaking** — Unused code is removed during production build
5. **No Console Logs** — All debugging logs removed for production (better performance)
6. **GSAP Performance** — `will-change` CSS properties used sparingly to optimize animations
7. **Event Listeners** — Use `{ passive: true }` where possible for better scroll performance

---

## Known Issues & Fixes

### Development Warnings

You might see warnings in development mode about:

- **GSAP targets not found** — This happens if animations run before elements are rendered. It's normal and doesn't affect production.
- **NgOptimizedImage aspect ratio** — Angular warns if image dimensions don't match intrinsic aspect ratios. These are disabled in production builds.
- **Angular hydration timeout** — Sometimes hydration takes > 10s in dev mode. This doesn't happen in production.

All these warnings are **development-only** and don't appear in production builds.

### Browser Compatibility

Tested and working on:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Deployment

This site is deployed to **GitHub Pages** and automatically rebuilds when I push to the `main` branch.

If you want to deploy it yourself:

1. Build the production version:

   ```bash
   npm run build
   ```

2. The `dist/Portfolio/browser/` folder contains the static files

3. Deploy that folder to any static hosting:
   - GitHub Pages
   - Netlify
   - Vercel
   - Cloudflare Pages
   - etc.

For SSR deployment (with Express server):

- Use the `dist/Portfolio/server/` folder
- Run `npm run serve:ssr:Portfolio`
- Deploy to a Node.js hosting platform (Railway, Render, etc.)

---

## Why I Built This

I needed a portfolio that:

- Actually works on mobile (so many portfolios are desktop-only)
- Shows real data (LeetCode/GitHub stats)
- Loads fast (SSR + optimization)
- Looks professional without being boring
- Doesn't use a template (custom design from scratch)

So I built it myself. No templates, no WordPress, no drag-and-drop builders. Just Angular, GSAP, and Tailwind.

---

## Contact

If you want to reach out or have questions:

- **Email:** adityapoojary07@gmail.com
- **LinkedIn:** [linkedin.com/in/aditya-poojary-](https://www.linkedin.com/in/aditya-poojary-/)
- **GitHub:** [github.com/aditya-poojary](https://github.com/aditya-poojary)
- **Twitter/X:** [@adityapoojaryO7](https://x.com/adityapoojaryO7)

---

## License

This is my personal portfolio. Feel free to fork it and use it as inspiration, but don't just copy-paste everything. Build something unique.

---

**Made with way too much coffee and late-night coding sessions.**
