import { ArrowLeft, Clock, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { SEO, createBreadcrumbSchema, seoConfig } from "../components/SEO";
import { blogs, getBlogBySlug, type BlogContentBlock } from "../data/blogs";

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

function ArticleBlock({ block }: { block: BlogContentBlock }) {
  if (block.type === "heading") return <h2><InlineText text={block.text} /></h2>;
  if (block.type === "subheading") return <h3><InlineText text={block.text} /></h3>;
  if (block.type === "quote") return <blockquote><InlineText text={block.text} /></blockquote>;
  if (block.type === "highlight") {
    return (
      <aside className="blog-highlight">
        <strong><InlineText text={block.title} /></strong>
        <p><InlineText text={block.text} /></p>
      </aside>
    );
  }
  if (block.type === "list") {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}><InlineText text={item} /></li>
        ))}
      </ul>
    );
  }
  return <p><InlineText text={block.text} /></p>;
}

export function BlogPostPage({ slug }: { slug: string }) {
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return (
      <main className="blog-page">
        <SEO title="Blog Not Found | The Baroda Chronicles" description="Explore insights from The Baroda Chronicles." url={`/blog/${slug}`} />
        <section className="blog-not-found">
          <p className="section-kicker">INSIGHTS</p>
          <h1>Story not found.</h1>
          <a className="ghost" href="/blog">
            <ArrowLeft size={17} />
            Back to Blog
          </a>
        </section>
      </main>
    );
  }

  const seoTitle = `${blog.seoTitle || blog.title} | The Baroda Chronicles`;
  const seoDescription = blog.seoDescription || blog.description;
  const blogUrl = `/blog/${blog.slug}`;
  const relatedBlogs = blogs.filter((item) => item.slug !== blog.slug).slice(0, 3);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.seoTitle || blog.title,
    description: seoDescription,
    image: seoConfig.absoluteUrl(blog.banner),
    author: {
      "@type": "Organization",
      "@id": `${seoConfig.siteUrl}/#organization`,
      name: seoConfig.siteName,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${seoConfig.siteUrl}/#organization`,
      name: seoConfig.siteName,
      logo: {
        "@type": "ImageObject",
        url: seoConfig.absoluteUrl(seoConfig.fallbackImage),
      },
    },
    datePublished: blog.datePublished,
    dateModified: blog.dateModified || blog.datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": seoConfig.absoluteUrl(blogUrl),
    },
    url: seoConfig.absoluteUrl(blogUrl),
    isPartOf: {
      "@id": `${seoConfig.siteUrl}/#website`,
    },
  };
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: blog.title, url: blogUrl },
  ]);

  return (
    <main className="blog-post-page">
      <SEO
        title={seoTitle}
        description={seoDescription}
        image={blog.banner}
        url={blogUrl}
        keywords={blog.keywords}
        type="article"
        article={{
          publishedTime: blog.datePublished,
          modifiedTime: blog.dateModified || blog.datePublished,
          author: seoConfig.siteName,
          section: blog.category,
          tags: blog.keywords,
        }}
        jsonLd={[articleSchema, breadcrumbSchema]}
      />
      <motion.article
        className="blog-article"
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <a className="blog-back" href="/blog">
          <ArrowLeft size={17} />
          Back to Blog
        </a>
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/blog">Blog</a>
          <span>/</span>
          <span>{blog.title}</span>
        </nav>
        <div className="blog-article-banner">
          <img src={blog.banner} alt={blog.imageAlt || `${blog.title} featured image`} />
        </div>
        <header className="blog-article-head">
          <span className="blog-badge">{blog.category}</span>
          <h1>{blog.title}</h1>
          <p>{blog.introduction}</p>
          <div className="blog-meta">
            <span>
              <Clock size={16} />
              {blog.readTime}
            </span>
            <span>
              <CalendarDays size={16} />
              {blog.date}
            </span>
          </div>
        </header>
        <div className="blog-content">
          {blog.content.map((block, index) => (
            <ArticleBlock block={block} key={`${block.type}-${index}`} />
          ))}
        </div>
        <nav className="blog-related" aria-label="Related blog posts">
          <p className="section-kicker">Related Insights</p>
          <h2>Keep reading</h2>
          <div>
            {relatedBlogs.map((item) => (
              <a href={`/blog/${item.slug}`} key={item.id}>
                <span>{item.category}</span>
                <strong>{item.title}</strong>
              </a>
            ))}
          </div>
        </nav>
      </motion.article>
    </main>
  );
}
