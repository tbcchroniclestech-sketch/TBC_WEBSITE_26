import { motion } from "framer-motion";

type BlogHeroProps = {
  label: string;
  title: string;
  description: string;
};

export function BlogHero({ label, title, description }: BlogHeroProps) {
  return (
    <motion.header
      className="blog-hero"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="section-kicker">{label}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </motion.header>
  );
}
