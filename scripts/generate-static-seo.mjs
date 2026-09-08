import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(projectRoot, "dist");
const srcBlogDataPath = path.join(projectRoot, "src", "data", "blogs.ts");
const templatePath = path.join(distDir, "index.html");

const siteUrl = "https://www.thebarodachronicles.com";
const siteName = "The Baroda Chronicles";
const brandDescription =
  "TBC - The Baroda Chronicles. Stories, satire, and sketches about real life. Simple, honest, and sometimes too real.";
const fallbackImage = "/assets/tbc-logo-official.png";

function loadBlogs() {
  const source = fs.readFileSync(srcBlogDataPath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require,
  });
  vm.runInContext(transpiled, context, { filename: srcBlogDataPath });
  return module.exports.blogs || context.exports.blogs || [];
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function absoluteUrl(pathOrUrl = "/") {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function cleanHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, "")
    .replace(/\s*<meta\s+(?:name|property)=["'](?:description|author|keywords|robots|og:[^"']+|twitter:[^"']+|article:[^"']+)["'][^>]*>\s*/gi, "")
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/\s*<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/gi, "");
}

function renderHead({ title, description, url, image = fallbackImage, type = "website", keywords = [], article, schema = [] }) {
  const canonical = absoluteUrl(url);
  const imageUrl = absoluteUrl(image);
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: absoluteUrl(fallbackImage),
      description: "Stories, satire, and sketches about real life. Simple, honest, and sometimes too real.",
      sameAs: ["https://www.instagram.com/the.baroda.chronicles/", "https://www.youtube.com/@TheBarodaChronicles"],
    },
    ...schema,
  ];

  const articleTags = article
    ? [
        article.datePublished ? `<meta property="article:published_time" content="${escapeHtml(article.datePublished)}" />` : "",
        article.dateModified ? `<meta property="article:modified_time" content="${escapeHtml(article.dateModified)}" />` : "",
        article.author ? `<meta property="article:author" content="${escapeHtml(article.author)}" />` : "",
        article.section ? `<meta property="article:section" content="${escapeHtml(article.section)}" />` : "",
        ...(article.tags || []).map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}" />`),
      ].filter(Boolean)
    : [];

  return `    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="author" content="${escapeHtml(siteName)}" />
    <meta name="robots" content="index, follow" />
    ${keywords.length ? `<meta name="keywords" content="${escapeHtml(keywords.join(", "))}" />` : ""}
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    ${articleTags.join("\n    ")}
    <script type="application/ld+json">${JSON.stringify(schemas)}</script>
`;
}

function applyDocument({ template, head, body }) {
  const cleaned = cleanHead(template);
  return cleaned
    .replace("</head>", `${head}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

function renderBlock(block) {
  if (block.type === "heading") return `<h2>${escapeHtml(block.text)}</h2>`;
  if (block.type === "subheading") return `<h3>${escapeHtml(block.text)}</h3>`;
  if (block.type === "quote") return `<blockquote>${escapeHtml(block.text)}</blockquote>`;
  if (block.type === "highlight") {
    return `<aside><strong>${escapeHtml(block.title)}</strong><p>${escapeHtml(block.text)}</p></aside>`;
  }
  if (block.type === "list") {
    return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }
  return `<p>${escapeHtml(block.text)}</p>`;
}

function renderBlogListing(blogs) {
  return `<main class="seo-prerender" aria-label="Blog listing">
    <h1>Stories, Strategies &amp; Ideas</h1>
    <p>Explore marketing insights, creative strategies, and industry knowledge from our team.</p>
    <nav aria-label="Blog posts">
      ${blogs
        .map(
          (blog) => `<article>
        <a href="/blog/${escapeHtml(blog.slug)}">
          <img src="${escapeHtml(blog.banner)}" alt="${escapeHtml(blog.imageAlt || `${blog.title} featured image`)}" />
          <span>${escapeHtml(blog.category)}</span>
          <h2>${escapeHtml(blog.title)}</h2>
          <p>${escapeHtml(blog.description)}</p>
        </a>
      </article>`,
        )
        .join("\n")}
    </nav>
  </main>`;
}

function renderBlogArticle(blog, relatedBlogs) {
  return `<main class="seo-prerender" aria-label="Blog article">
    <article>
      <img src="${escapeHtml(blog.banner)}" alt="${escapeHtml(blog.imageAlt || `${blog.title} featured image`)}" />
      <span>${escapeHtml(blog.category)}</span>
      <h1>${escapeHtml(blog.title)}</h1>
      <p>${escapeHtml(blog.introduction)}</p>
      <p>${escapeHtml(blog.readTime)} · ${escapeHtml(blog.date)}</p>
      ${blog.content.map(renderBlock).join("\n")}
    </article>
    <nav aria-label="Related articles">
      <h2>Related Articles</h2>
      ${relatedBlogs.map((item) => `<a href="/blog/${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a>`).join("\n")}
    </nav>
  </main>`;
}

function renderHome() {
  return `<main class="seo-prerender" aria-label="The Baroda Chronicles">
    <h1>Internet culture, filmed with a city-sized side eye.</h1>
    <p>${escapeHtml(brandDescription)}</p>
    <nav aria-label="Important pages">
      <a href="/blog">Blog</a>
      <a href="/#work">Work</a>
      <a href="/#contact">Contact</a>
    </nav>
  </main>`;
}

function writeRoute(route, html) {
  const routePath = route === "/" ? distDir : path.join(distDir, route.replace(/^\//, ""));
  fs.mkdirSync(routePath, { recursive: true });
  fs.writeFileSync(path.join(routePath, "index.html"), html);
}

function writeSitemap(blogs) {
  const maxDate = blogs
    .map((blog) => blog.dateModified || blog.datePublished)
    .filter(Boolean)
    .sort()
    .at(-1);
  const urls = [
    { loc: `${siteUrl}/`, lastmod: maxDate || "2026-09-08", changefreq: "weekly", priority: "1.0" },
    { loc: `${siteUrl}/blog`, lastmod: maxDate || "2026-09-08", changefreq: "weekly", priority: "0.8" },
    ...blogs.map((blog) => ({
      loc: `${siteUrl}/blog/${blog.slug}`,
      lastmod: blog.dateModified || blog.datePublished,
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeHtml(url.loc)}</loc>
    <lastmod>${escapeHtml(url.lastmod)}</lastmod>
    <changefreq>${escapeHtml(url.changefreq)}</changefreq>
    <priority>${escapeHtml(url.priority)}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
}

function writeRobots() {
  fs.writeFileSync(path.join(distDir, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`);
}

const blogs = loadBlogs();
const template = fs.readFileSync(templatePath, "utf8");

const hiddenPrerenderStyle =
  "    <style>.seo-prerender{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:normal;border:0}</style>\n";

writeRoute(
  "/",
  applyDocument({
    template,
    head:
      hiddenPrerenderStyle +
      renderHead({
        title: "The Baroda Chronicles | Stories, Satire & Creative Production",
        description: brandDescription,
        url: "/",
        image: fallbackImage,
        keywords: [
          "The Baroda Chronicles",
          "Baroda creative agency",
          "Vadodara stories",
          "social media marketing",
          "reels production",
          "creative production house",
        ],
      }),
    body: renderHome(),
  }),
);

writeRoute(
  "/blog",
  applyDocument({
    template,
    head:
      hiddenPrerenderStyle +
      renderHead({
        title: "Stories, Strategies & Ideas | The Baroda Chronicles",
        description: "Explore marketing insights, creative strategies, and industry knowledge from The Baroda Chronicles.",
        url: "/blog",
        image: blogs[0]?.banner || fallbackImage,
        keywords: ["The Baroda Chronicles blog", "social media marketing", "creative strategy", "Instagram growth", "Vadodara stories"],
        schema: [
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Stories, Strategies & Ideas",
            url: absoluteUrl("/blog"),
            description: "Explore marketing insights, creative strategies, and industry knowledge from The Baroda Chronicles.",
            blogPost: blogs.map((blog) => ({
              "@type": "BlogPosting",
              headline: blog.seoTitle || blog.title,
              url: absoluteUrl(`/blog/${blog.slug}`),
              datePublished: blog.datePublished,
              dateModified: blog.dateModified || blog.datePublished,
            })),
          },
        ],
      }),
    body: renderBlogListing(blogs),
  }),
);

for (const blog of blogs) {
  const blogUrl = `/blog/${blog.slug}`;
  const related = blogs.filter((item) => item.slug !== blog.slug).slice(0, 3);
  const description = blog.seoDescription || blog.description;
  const title = `${blog.seoTitle || blog.title} | ${siteName}`;
  writeRoute(
    blogUrl,
    applyDocument({
      template,
      head:
        hiddenPrerenderStyle +
        renderHead({
          title,
          description,
          url: blogUrl,
          image: blog.banner,
          type: "article",
          keywords: blog.keywords || [],
          article: {
            datePublished: blog.datePublished,
            dateModified: blog.dateModified || blog.datePublished,
            author: siteName,
            section: blog.category,
            tags: blog.keywords || [],
          },
          schema: [
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: blog.seoTitle || blog.title,
              description,
              image: absoluteUrl(blog.banner),
              author: {
                "@type": "Organization",
                name: siteName,
              },
              publisher: {
                "@type": "Organization",
                name: siteName,
                logo: {
                  "@type": "ImageObject",
                  url: absoluteUrl(fallbackImage),
                },
              },
              datePublished: blog.datePublished,
              dateModified: blog.dateModified || blog.datePublished,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": absoluteUrl(blogUrl),
              },
              url: absoluteUrl(blogUrl),
            },
          ],
        }),
      body: renderBlogArticle(blog, related),
    }),
  );
}

writeSitemap(blogs);
writeRobots();

console.log(`Generated static SEO HTML for ${blogs.length} blogs.`);
