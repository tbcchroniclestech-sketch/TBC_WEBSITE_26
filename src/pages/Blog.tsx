import { BlogCard } from "../components/BlogCard";
import { BlogHero } from "../components/BlogHero";
import { SEO, createBreadcrumbSchema, seoConfig } from "../components/SEO";
import { blogs } from "../data/blogs";

export function BlogPage() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Stories, Strategies & Ideas",
    url: seoConfig.absoluteUrl("/blog"),
    description: "Explore marketing insights, creative strategies, and industry knowledge from The Baroda Chronicles.",
    publisher: {
      "@id": `${seoConfig.siteUrl}/#organization`,
    },
    blogPost: blogs.map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.seoTitle || blog.title,
      url: seoConfig.absoluteUrl(`/blog/${blog.slug}`),
      datePublished: blog.datePublished,
      dateModified: blog.dateModified || blog.datePublished,
    })),
  };

  return (
    <main className="blog-page">
      <SEO
        title="Stories, Strategies & Ideas | The Baroda Chronicles"
        description="Explore marketing insights, creative strategies, and industry knowledge from The Baroda Chronicles."
        image={blogs[0]?.banner}
        url="/blog"
        keywords={["The Baroda Chronicles blog", "social media marketing", "creative strategy", "Instagram growth", "Vadodara stories"]}
        jsonLd={[
          blogSchema,
          createBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
          ]),
        ]}
      />
      <BlogHero
        label="INSIGHTS"
        title="Stories, Strategies & Ideas"
        description="Explore marketing insights, creative strategies, and industry knowledge from our team."
      />
      <nav className="breadcrumb-nav breadcrumb-nav-centered" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <span>Blog</span>
      </nav>
      <section className="blog-grid" aria-label="Blog posts">
        {blogs.map((blog, index) => (
          <BlogCard blog={blog} index={index} key={blog.id} />
        ))}
      </section>
    </main>
  );
}
