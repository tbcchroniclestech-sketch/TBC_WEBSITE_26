import { Helmet } from "react-helmet-async";

const siteUrl = "https://thebarodachronicles.com";
const siteName = "The Baroda Chronicles";
const brandDescription =
  "Stories, satire, and sketches about real life. Simple, honest, and sometimes too real.";
const fallbackImage = "/assets/tbc-logo-official.png";

type ArticleMeta = {
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
};

type SEOProps = {
  title: string;
  description: string;
  image?: string;
  url?: string;
  keywords?: string[];
  type?: "website" | "article";
  article?: ArticleMeta;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function absoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return siteUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: absoluteUrl(fallbackImage),
    description: brandDescription,
    sameAs: ["https://www.instagram.com/the.baroda.chronicles/", "https://www.youtube.com/@TheBarodaChronicles"],
  };
}

export function SEO({
  title,
  description,
  image = fallbackImage,
  url = "/",
  keywords = [],
  type = "website",
  article,
  jsonLd,
}: SEOProps) {
  const canonicalUrl = absoluteUrl(url);
  const imageUrl = absoluteUrl(image);
  const schemas = [createOrganizationSchema(), ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [])];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 ? <meta name="keywords" content={keywords.join(", ")} /> : null}
      <meta name="author" content={siteName} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {type === "article" && article?.publishedTime ? <meta property="article:published_time" content={article.publishedTime} /> : null}
      {type === "article" && article?.modifiedTime ? <meta property="article:modified_time" content={article.modifiedTime} /> : null}
      {type === "article" && article?.author ? <meta property="article:author" content={article.author} /> : null}
      {type === "article" && article?.section ? <meta property="article:section" content={article.section} /> : null}
      {type === "article" && article?.tags?.map((tag) => <meta property="article:tag" content={tag} key={tag} />)}

      <script type="application/ld+json">{JSON.stringify(schemas)}</script>
    </Helmet>
  );
}

export const seoConfig = {
  siteUrl,
  siteName,
  brandDescription,
  fallbackImage,
  absoluteUrl,
};
