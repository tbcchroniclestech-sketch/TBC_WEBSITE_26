import { motion } from "framer-motion";
import { SEO, createBreadcrumbSchema, seoConfig } from "../components/SEO";

const services = [
  "Influencer Marketing",
  "UGC Content Creation",
  "Meta Campaigns",
  "Content Writing",
  "Website Designing",
  "Social Media Management",
  "LinkedIn Marketing",
];

export function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About The Baroda Chronicles",
    url: seoConfig.absoluteUrl("/about"),
    description:
      "The Baroda Chronicles is a Baroda/Vadodara creative production house and digital growth partner creating stories, satire, sketches, campaigns and social-first content.",
    isPartOf: {
      "@id": `${seoConfig.siteUrl}/#website`,
    },
    about: {
      "@id": `${seoConfig.siteUrl}/#organization`,
    },
  };

  return (
    <main className="entity-page">
      <SEO
        title="About The Baroda Chronicles | TBC"
        description="Meet The Baroda Chronicles, a Baroda/Vadodara creative production house creating stories, satire, sketches, campaigns and social-first brand work."
        image="/assets/tbc-team-photo.jpeg"
        url="/about"
        keywords={["The Baroda Chronicles", "TBC", "Baroda creative agency", "Vadodara content agency", "creative production house"]}
        jsonLd={[
          aboutSchema,
          createBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "About", url: "/about" },
          ]),
        ]}
      />
      <motion.section
        className="entity-hero"
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <span>About</span>
        </nav>
        <p className="section-kicker">ABOUT TBC</p>
        <h1>The people behind the stories.</h1>
        <p>
          The Baroda Chronicles is powered by a multidisciplinary team that brings together strategy, creativity, technology, production and social media under one roof.
        </p>
      </motion.section>

      <section className="entity-split">
        <div className="entity-card entity-card-dark">
          <span>What we make</span>
          <h2>Stories. Systems. Campaigns. Culture.</h2>
          <p>
            TBC - The Baroda Chronicles creates stories, satire, sketches and social-first work about real life. Simple, honest and sometimes too real.
          </p>
        </div>
        <div className="entity-card">
          <span>Where we work</span>
          <h2>Baroda/Vadodara, online and on the street.</h2>
          <p>
            We build work for brands, creators and businesses that want content people actually watch, remember and share.
          </p>
        </div>
      </section>

      <section className="entity-grid" aria-label="TBC services">
        {services.map((service) => (
          <article className="entity-pill" key={service}>
            {service}
          </article>
        ))}
      </section>

      <section className="entity-cta">
        <p className="section-kicker">Next</p>
        <h2>Explore the work, read the thinking, or start a conversation.</h2>
        <div>
          <a className="ghost" href="/blog">Read the blog</a>
          <a className="magnetic" href="/contact">Contact TBC</a>
        </div>
      </section>
    </main>
  );
}
