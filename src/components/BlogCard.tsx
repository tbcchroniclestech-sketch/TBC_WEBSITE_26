import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Blog } from "../data/blogs";

type BlogCardProps = {
  blog: Blog;
  index: number;
};

export function BlogCard({ blog, index }: BlogCardProps) {
  return (
    <motion.article
      className="blog-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.64, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href={`/blog/${blog.slug}`} aria-label={`Read ${blog.title}`}>
        <div className="blog-card-image">
          <img src={blog.banner} alt={blog.imageAlt || `${blog.title} featured image`} loading="lazy" decoding="async" />
        </div>
        <div className="blog-card-body">
          <span className="blog-badge">{blog.category}</span>
          <h2>{blog.title}</h2>
          <p>{blog.description}</p>
          <span className="blog-read-more">
            Read More
            <ArrowUpRight size={17} />
          </span>
        </div>
      </a>
    </motion.article>
  );
}
