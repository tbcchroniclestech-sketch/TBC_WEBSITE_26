import { Instagram, Mail, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { SEO, createBreadcrumbSchema, seoConfig } from "../components/SEO";

export function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact The Baroda Chronicles",
    url: seoConfig.absoluteUrl("/contact"),
    description: "Contact The Baroda Chronicles for brand campaigns, content production, social media, UGC and creative strategy.",
    isPartOf: {
      "@id": `${seoConfig.siteUrl}/#website`,
    },
    mainEntity: {
      "@id": `${seoConfig.siteUrl}/#organization`,
    },
  };

  return (
    <main className="entity-page">
      <SEO
        title="Contact The Baroda Chronicles | TBC"
        description="Contact The Baroda Chronicles for brand campaigns, content production, social media, UGC, creative strategy and digital growth."
        image="/assets/tbc-logo-official.png"
        url="/contact"
        keywords={["contact The Baroda Chronicles", "TBC contact", "Baroda creative agency", "Vadodara social media agency"]}
        jsonLd={[
          contactSchema,
          createBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Contact", url: "/contact" },
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
          <span>Contact</span>
        </nav>
        <p className="section-kicker">CONTACT</p>
        <h1>Bring us a brand, a venue, a half-formed joke, or a very serious launch problem.</h1>
        <p>
          For campaigns, collaborations, UGC, social media management, websites, writing and creative production, reach The Baroda Chronicles here.
        </p>
      </motion.section>

      <section className="entity-contact-panel" aria-label="Contact The Baroda Chronicles">
        <a className="contact-link" href={`mailto:${seoConfig.contactEmail}`}>
          <span className="contact-link-icon" aria-hidden="true"><Mail size={20} /></span>
          <span>
            <strong>Email</strong>
            <small>{seoConfig.contactEmail}</small>
          </span>
        </a>
        <a className="contact-link" href="https://www.instagram.com/the.baroda.chronicles/" target="_blank" rel="noreferrer">
          <span className="contact-link-icon" aria-hidden="true"><Instagram size={20} /></span>
          <span>
            <strong>Instagram</strong>
            <small>@the.baroda.chronicles</small>
          </span>
        </a>
        <a className="contact-link" href="https://www.youtube.com/@TheBarodaChronicles" target="_blank" rel="noreferrer">
          <span className="contact-link-icon" aria-hidden="true"><Youtube size={20} /></span>
          <span>
            <strong>YouTube</strong>
            <small>@TheBarodaChronicles</small>
          </span>
        </a>
      </section>
    </main>
  );
}
