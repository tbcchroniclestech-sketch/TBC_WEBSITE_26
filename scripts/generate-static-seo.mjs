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
const siteAlternateName = "TBC";
const contactEmail = "info@thebarodachronicles.com";
const brandDescription =
  "TBC - The Baroda Chronicles. Stories, satire, and sketches about real life. Simple, honest, and sometimes too real.";
const fallbackImage = "/assets/tbc-logo-official.png";
const socialProfiles = ["https://www.instagram.com/the.baroda.chronicles/", "https://www.youtube.com/@TheBarodaChronicles"];

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

function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    alternateName: siteAlternateName,
    url: siteUrl,
    logo: absoluteUrl(fallbackImage),
    description: "Stories, satire, and sketches about real life. Simple, honest, and sometimes too real.",
    email: contactEmail,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "business inquiries",
      email: contactEmail,
      url: `${siteUrl}/#contact`,
    },
    sameAs: socialProfiles,
  };
}

function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    alternateName: siteAlternateName,
    url: siteUrl,
    description: "Stories, satire, and sketches about real life. Simple, honest, and sometimes too real.",
    inLanguage: "en",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  };
}

function createBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

function cleanHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, "")
    .replace(/\s*<meta\s+(?:name|property)=["'](?:description|author|keywords|robots|og:[^"']+|twitter:[^"']+|article:[^"']+)["'][^>]*>\s*/gi, "")
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/\s*<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/gi, "");
}

function renderHead({ title, description, url, image = fallbackImage, type = "website", keywords = [], robots = "index, follow", article, schema = [] }) {
  const canonical = absoluteUrl(url);
  const imageUrl = absoluteUrl(image);
  const schemas = [createOrganizationSchema(), createWebSiteSchema(), ...schema];

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
    <meta name="robots" content="${escapeHtml(robots)}" />
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
    <nav aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span>Blog</span>
    </nav>
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
    <nav aria-label="Breadcrumb">
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <span>${escapeHtml(blog.title)}</span>
    </nav>
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
      <a href="/about">About</a>
      <a href="/blog">Blog</a>
      <a href="/#work">Work</a>
      <a href="/contact">Contact</a>
    </nav>
  </main>`;
}

function renderAbout() {
  return `<main class="seo-prerender" aria-label="About The Baroda Chronicles">
    <nav aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span>About</span>
    </nav>
    <h1>The people behind the stories.</h1>
    <p>The Baroda Chronicles is powered by a multidisciplinary team that brings together strategy, creativity, technology, production and social media under one roof.</p>
    <p>TBC - The Baroda Chronicles creates stories, satire, sketches and social-first brand work about real life. Simple, honest and sometimes too real.</p>
    <nav aria-label="About page links">
      <a href="/blog">Blog</a>
      <a href="/contact">Contact TBC</a>
    </nav>
  </main>`;
}

function renderContact() {
  return `<main class="seo-prerender" aria-label="Contact The Baroda Chronicles">
    <nav aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span>Contact</span>
    </nav>
    <h1>Contact The Baroda Chronicles</h1>
    <p>Contact The Baroda Chronicles for brand campaigns, content production, social media, UGC, creative strategy and digital growth.</p>
    <address>
      <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>
      <a href="https://www.instagram.com/the.baroda.chronicles/">Instagram</a>
      <a href="https://www.youtube.com/@TheBarodaChronicles">YouTube</a>
    </address>
  </main>`;
}

function renderNotFound() {
  return `<main class="seo-prerender" aria-label="Page not found">
    <nav aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span>Page Not Found</span>
    </nav>
    <h1>Page not found.</h1>
    <p>That URL does not match a live TBC page.</p>
    <nav aria-label="404 page links">
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <a href="/contact">Contact</a>
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
    { loc: `${siteUrl}/about`, lastmod: maxDate || "2026-09-08", changefreq: "monthly", priority: "0.7" },
    { loc: `${siteUrl}/blog`, lastmod: maxDate || "2026-09-08", changefreq: "weekly", priority: "0.8" },
    { loc: `${siteUrl}/contact`, lastmod: maxDate || "2026-09-08", changefreq: "monthly", priority: "0.7" },
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
  "/about",
  applyDocument({
    template,
    head:
      hiddenPrerenderStyle +
      renderHead({
        title: "About The Baroda Chronicles | TBC",
        description: "Meet The Baroda Chronicles, a Baroda/Vadodara creative production house creating stories, satire, sketches, campaigns and social-first brand work.",
        url: "/about",
        image: "/assets/tbc-team-photo.jpeg",
        keywords: ["The Baroda Chronicles", "TBC", "Baroda creative agency", "Vadodara content agency", "creative production house"],
        schema: [
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About The Baroda Chronicles",
            url: absoluteUrl("/about"),
            description:
              "The Baroda Chronicles is a Baroda/Vadodara creative production house and digital growth partner creating stories, satire, sketches, campaigns and social-first content.",
            isPartOf: {
              "@id": `${siteUrl}/#website`,
            },
            about: {
              "@id": `${siteUrl}/#organization`,
            },
          },
          createBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "About", url: "/about" },
          ]),
        ],
      }),
    body: renderAbout(),
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
            publisher: {
              "@id": `${siteUrl}/#organization`,
            },
            blogPost: blogs.map((blog) => ({
              "@type": "BlogPosting",
              headline: blog.seoTitle || blog.title,
              url: absoluteUrl(`/blog/${blog.slug}`),
              datePublished: blog.datePublished,
              dateModified: blog.dateModified || blog.datePublished,
            })),
          },
          createBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
          ]),
        ],
      }),
    body: renderBlogListing(blogs),
  }),
);

writeRoute(
  "/contact",
  applyDocument({
    template,
    head:
      hiddenPrerenderStyle +
      renderHead({
        title: "Contact The Baroda Chronicles | TBC",
        description: "Contact The Baroda Chronicles for brand campaigns, content production, social media, UGC, creative strategy and digital growth.",
        url: "/contact",
        image: fallbackImage,
        keywords: ["contact The Baroda Chronicles", "TBC contact", "Baroda creative agency", "Vadodara social media agency"],
        schema: [
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact The Baroda Chronicles",
            url: absoluteUrl("/contact"),
            description: "Contact The Baroda Chronicles for brand campaigns, content production, social media, UGC and creative strategy.",
            isPartOf: {
              "@id": `${siteUrl}/#website`,
            },
            mainEntity: {
              "@id": `${siteUrl}/#organization`,
            },
          },
          createBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Contact", url: "/contact" },
          ]),
        ],
      }),
    body: renderContact(),
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
                "@id": `${siteUrl}/#organization`,
                name: siteName,
              },
              publisher: {
                "@type": "Organization",
                "@id": `${siteUrl}/#organization`,
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
              isPartOf: {
                "@id": `${siteUrl}/#website`,
              },
            },
            createBreadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Blog", url: "/blog" },
              { name: blog.title, url: blogUrl },
            ]),
          ],
        }),
      body: renderBlogArticle(blog, related),
    }),
  );
}

fs.writeFileSync(
  path.join(distDir, "404.html"),
  applyDocument({
    template,
    head:
      hiddenPrerenderStyle +
      renderHead({
        title: "Page Not Found | The Baroda Chronicles",
        description: "This page could not be found. Explore The Baroda Chronicles homepage, blog, about page or contact page.",
        url: "/404",
        image: fallbackImage,
        robots: "noindex, follow",
        schema: [
          createBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Page Not Found", url: "/404" },
          ]),
        ],
      }),
    body: renderNotFound(),
  }),
);

writeSitemap(blogs);
writeRobots();

console.log(`Generated static SEO HTML for ${blogs.length} blogs.`);
