# The Baroda Chronicles Website

Premium React/Vite website for The Baroda Chronicles, a creative production house and city storytelling brand from Baroda. The site includes the interactive homepage, agency/services showcase, YouTube showcase, contact section, SEO metadata, and a scalable blog system.

## Tech Stack

- React 19
- TypeScript
- Vite
- Framer Motion
- GSAP
- Lenis
- Three.js / React Three Fiber
- React Helmet Async

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The dev server runs on `127.0.0.1`.

## Production Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Project Structure

```text
src/
  components/
    BlogCard.tsx
    BlogHero.tsx
    SEO.tsx
  data/
    blogs.ts
    tbc_instagram_posts_full.json
  pages/
    Blog.tsx
    BlogPost.tsx
  main.tsx
  styles.css
public/
  assets/
  robots.txt
  sitemap.xml
```

## Blog Architecture

Blogs are stored in `src/data/blogs.ts` as typed objects. Each blog includes:

- `id`
- `slug`
- `title`
- `category`
- `banner`
- `description`
- `introduction`
- `date`
- `datePublished`
- `dateModified`
- `readTime`
- `seoTitle`
- `seoDescription`
- `keywords`
- `imageAlt`
- `content`

To add a new blog, add a new object to the `blogs` array and update `public/sitemap.xml` with the new public URL.

## SEO Architecture

SEO is handled through `src/components/SEO.tsx` using `react-helmet-async`. Pages pass title, description, image, canonical URL, keywords, Open Graph metadata, Twitter metadata, and JSON-LD schema data through this component.

Blog detail pages generate blog-specific metadata from `src/data/blogs.ts`, so new blogs should not need separate hardcoded SEO components.

## Vercel Deployment

This project is intended to deploy from GitHub to Vercel.

GitHub repository:

```text
https://github.com/tbcchroniclestech-sketch/TBC_WEBSITE_26.git
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

`vercel.json` includes an SPA rewrite so direct links such as `/blog` and `/blog/reels-reach-suddenly-drops` resolve to `index.html` while static assets remain available from `public`.

The Vite config intentionally uses `base: "./"` and manual chunks for production hosting compatibility. Do not change this casually.
