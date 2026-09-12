import { ArrowLeft } from "lucide-react";
import { SEO, createBreadcrumbSchema } from "../components/SEO";

export function NotFoundPage({ path = "/404" }: { path?: string }) {
  return (
    <main className="entity-page">
      <SEO
        title="Page Not Found | The Baroda Chronicles"
        description="This page could not be found. Explore The Baroda Chronicles homepage, blog, about page or contact page."
        url={path}
        robots="noindex, follow"
        jsonLd={[
          createBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Page Not Found", url: path },
          ]),
        ]}
      />
      <section className="blog-not-found">
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <span>Page Not Found</span>
        </nav>
        <p className="section-kicker">404</p>
        <h1>Page not found.</h1>
        <p className="entity-muted">That URL does not match a live TBC page.</p>
        <div className="not-found-actions">
          <a className="ghost" href="/">
            <ArrowLeft size={17} />
            Back home
          </a>
          <a className="magnetic" href="/blog">Read the blog</a>
        </div>
      </section>
    </main>
  );
}
