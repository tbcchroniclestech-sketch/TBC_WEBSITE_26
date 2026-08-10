# TBC Website Development Notes

## Repository

- GitHub: `https://github.com/tbcchroniclestech-sketch/TBC_WEBSITE_26.git`
- Primary branch: `main`
- Intended Git identity:
  - Name: `tbcchroniclestech-sketch`
  - Email: `tbc.chronicles.tech@gmail.com`

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Deployment Workflow

```text
Local development
  -> git add .
  -> git commit
  -> git push origin main
  -> GitHub
  -> Vercel automatic deployment
```

## Vercel Considerations

- Build command: `npm run build`
- Output directory: `dist`
- The app is a React/Vite single page app.
- `vercel.json` rewrites app routes to `index.html` while preserving static assets.
- Keep `vite.config.ts` hosting settings unless a deployment issue is confirmed.

## Routing

The site currently handles routes in `src/main.tsx` based on `window.location.pathname`.

Important routes:

- `/`
- `/blog`
- `/blog/reels-reach-suddenly-drops`

Direct URL access depends on the Vercel SPA rewrite.

## Blog Structure

Blogs live in `src/data/blogs.ts`.

To add a blog:

1. Add the banner image to `public/assets/`.
2. Add a typed blog object to the `blogs` array.
3. Include SEO fields such as `seoTitle`, `seoDescription`, `keywords`, and `imageAlt`.
4. Add the route to `public/sitemap.xml`.
5. Run `npm run build`.

## SEO Structure

SEO is centralized in `src/components/SEO.tsx`.

It supports:

- Page title
- Meta description
- Canonical URL
- Open Graph metadata
- Twitter metadata
- Organization JSON-LD
- BlogPosting JSON-LD

Do not hardcode separate SEO implementations for each blog unless the central SEO component cannot cover the use case.

## Environment Variables

No required environment variables are currently documented for this static frontend.

Do not commit `.env`, `.env.local`, or secret values. If future environment variables are required, add only variable names and safe placeholder values to an `.env.example` file.

## Important Files

- `src/main.tsx`: homepage, route selection, major interactive sections
- `src/styles.css`: global styling and responsive behavior
- `src/data/blogs.ts`: blog source data
- `src/components/SEO.tsx`: SEO metadata and schema
- `vite.config.ts`: Vite build and hosting behavior
- `vercel.json`: SPA routing for Vercel
- `public/sitemap.xml`: crawlable URL list
- `public/robots.txt`: crawler permissions

## Do Not Change Casually

- Vite `base` configuration
- Vercel rewrites
- Blog slug structure
- SEO component contract
- Public asset paths used by blog and social metadata
- `.gitignore` rules that exclude generated output, dependencies, and environment files
