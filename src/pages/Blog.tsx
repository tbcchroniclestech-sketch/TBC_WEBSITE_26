import { BlogCard } from "../components/BlogCard";
import { BlogHero } from "../components/BlogHero";
import { SEO } from "../components/SEO";
import { blogs } from "../data/blogs";

export function BlogPage() {
  return (
    <main className="blog-page">
      <SEO
        title="Stories, Strategies & Ideas | The Baroda Chronicles"
        description="Explore marketing insights, creative strategies, and industry knowledge from The Baroda Chronicles."
        image={blogs[0]?.banner}
        url="/blog"
        keywords={["The Baroda Chronicles blog", "social media marketing", "creative strategy", "Instagram growth", "Vadodara stories"]}
      />
      <BlogHero
        label="INSIGHTS"
        title="Stories, Strategies & Ideas"
        description="Explore marketing insights, creative strategies, and industry knowledge from our team."
      />
      <section className="blog-grid" aria-label="Blog posts">
        {blogs.map((blog, index) => (
          <BlogCard blog={blog} index={index} key={blog.id} />
        ))}
      </section>
    </main>
  );
}
