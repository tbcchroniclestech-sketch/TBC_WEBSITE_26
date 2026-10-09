import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  BadgeCheck,
  Clapperboard,
  Eye,
  Heart,
  Instagram,
  Mail,
  MessageCircle,
  Mic2,
  Play,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import instagramPosts from "./data/tbc_instagram_posts_full.json";
import { SEO } from "./components/SEO";
import { VinylTurntable } from "./components/VinylTurntable";
import { BlogPage } from "./pages/Blog";
import { BlogPostPage } from "./pages/BlogPost";
import { AboutPage } from "./pages/About";
import { ContactPage } from "./pages/Contact";
import { NotFoundPage } from "./pages/NotFound";
import { getBlogBySlug } from "./data/blogs";
import { initializeGA4RouteTracking } from "./utils/ga4";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

type InstagramPost = {
  title?: string;
  category?: string;
  url?: string | null;
  views?: number | null;
  plays?: number | null;
  likes?: number | null;
  comments?: number | null;
  caption?: string | null;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  displayImage?: string | null;
};

type FeaturedReel = {
  title: string;
  category: string;
  reelUrl?: string;
  thumbnailUrl: string;
  fallbackImageUrl?: string;
  likes?: number;
  views?: number;
  comments?: number;
  shortDescription: string;
};

type AgencyStory = {
  title: string;
  line: string;
  blurb: string;
  tags: string[];
  visual: "influence" | "ugc" | "meta" | "writing" | "website" | "social" | "linkedin";
};

type YouTubeVideo = {
  id: string;
  title: string;
  duration: string;
  category: string;
  thumbnailUrl: string;
  fallbackThumbnailUrl: string;
  url: string;
};

type TeamLead = {
  name: string;
  role: string;
  description: string[];
};

type TeamMember = {
  name: string;
  role: string;
  description: string;
};

const localThumbnailFallbacks: Record<string, string> = {
  "https://www.instagram.com/p/DaA-HR6qykb/": "/assets/grid.png",
  "https://www.instagram.com/p/DZpSMESv-jK/": "/assets/somewhere.png",
  "https://www.instagram.com/p/DZQCw7rKgwC/": "/assets/vadodara-moved.png",
  "https://www.instagram.com/p/DaAcJCwIfPY/": "/assets/gujarati-dialogues.png",
  "https://www.instagram.com/p/DXxgZIBqc1d/": "/assets/maha-guj-media-only.png",
};

const localThumbnailOverrides: Record<string, string> = {
  "https://www.instagram.com/p/DXxgZIBqc1d/": "/assets/maha-guj-media-only.png",
};

const featuredReels: FeaturedReel[] = (instagramPosts as InstagramPost[])
  .map((post) => {
    const description = (post.caption || "")
      .replace(/\s+/g, " ")
      .split(".")
      .find(Boolean)
      ?.trim();

    return {
      title: post.title || "Untitled reel",
      category: post.category || "Storytelling",
      reelUrl: post.url || undefined,
      thumbnailUrl: post.url && localThumbnailOverrides[post.url] ? localThumbnailOverrides[post.url] : post.thumbnail_url || post.thumbnail || post.displayImage || "",
      fallbackImageUrl: post.url ? localThumbnailFallbacks[post.url] : undefined,
      likes: post.likes ?? undefined,
      views: post.views ?? undefined,
      comments: post.comments ?? undefined,
      shortDescription: description || "A Baroda story built for the scroll.",
    };
  })
  .filter((post) => post.thumbnailUrl)
  .sort((a, b) => (b.views || 0) - (a.views || 0) || (b.likes || 0) - (a.likes || 0))
  .slice(0, 5);

const agencyStories: AgencyStory[] = [
  {
    title: "Influencer Marketing",
    line: "People trust people before they trust brands.",
    blurb: "Creators that actually move culture.",
    tags: ["Creator Network", "Campaign Strategy", "Performance Tracking"],
    visual: "influence",
  },
  {
    title: "UGC Content",
    line: "Content that never feels like advertising.",
    blurb: "Looks native. Sells naturally.",
    tags: ["Reels", "Creator Content", "Authentic Ads"],
    visual: "ugc",
  },
  {
    title: "Meta Campaigns",
    line: "Reach the people who actually matter.",
    blurb: "Performance without wasting budget.",
    tags: ["Facebook Ads", "Instagram Ads", "ROI Focus"],
    visual: "meta",
  },
  {
    title: "Content Writing",
    line: "Words people actually finish reading.",
    blurb: "Clean ideas, sharper sentences.",
    tags: ["Captions", "Scripts", "Storytelling"],
    visual: "writing",
  },
  {
    title: "Website Designing",
    line: "Beautiful websites built to convert.",
    blurb: "Beautiful enough to stop scrolling.",
    tags: ["UI/UX", "Landing Pages", "Conversion Design"],
    visual: "website",
  },
  {
    title: "Social Media Management",
    line: "Consistency becomes culture.",
    blurb: "Rhythm, relevance, and recall.",
    tags: ["Planning", "Publishing", "Analytics"],
    visual: "social",
  },
  {
    title: "LinkedIn Marketing",
    line: "Authority before advertising.",
    blurb: "Build trust before the pitch.",
    tags: ["Personal Branding", "Lead Generation", "B2B Growth"],
    visual: "linkedin",
  },
];

const agencyVisualImages: Partial<Record<AgencyStory["visual"], string>> = {
  influence: "/assets/agency-influencer-marketing.webp",
  ugc: "/assets/agency-ugc-content.webp",
  meta: "/assets/agency-meta-campaign.webp",
  writing: "/assets/agency-content-writing.svg",
  website: "/assets/agency-website-designing.webp",
  social: "/assets/agency-social-media-management.webp",
  linkedin: "/assets/agency-linkedin-marketing.webp",
};

const youtubeChannelUrl = "https://www.youtube.com/@TheBarodaChronicles";

const teamLeads: TeamLead[] = [
  {
    name: "Nirmal Jobanputra",
    role: "CO-FOUNDER & BRAND STRATEGIST",
    description: [
      "With over 15 years of experience across marketing, branding, advertising and content, Nirmal brings together strategy, storytelling and business thinking. His journey spans copywriting, client servicing, social media, campaign strategy and brand building, giving him a deep understanding of how ideas turn into brands people remember.",
      "At The Baroda Chronicles, he leads brand strategy, creative direction, partnerships and business growth, helping shape TBC into a contemporary media and marketing platform built around culture, conversations and compelling storytelling.",
    ],
  },
  {
    name: "Aniket Sheth",
    role: "CREATIVE HEAD",
    description: [
      "A storyteller at heart and a creative strategist by profession, Aniket has been part of The Baroda Chronicles since its inception, shaping its creative voice alongside the founding team.",
      "With experience spanning copywriting, scriptwriting, theatre, advertising, campaign ideation and production, he brings an instinctive understanding of what makes people stop, watch and remember. At TBC, Aniket leads creative direction, concepts, scripts and storytelling, helping transform everyday observations, culture and conversations into content that feels distinctly TBC.",
    ],
  },
];

const teamMembers: TeamMember[] = [
  {
    name: "Vamsee",
    role: "Technology & Automation",
    description: "Leads the technology side of TBC, building smarter systems, workflows and digital solutions that make the team faster and more efficient.",
  },
  {
    name: "Vibhav",
    role: "In-House Editor",
    description: "Turns ideas and footage into sharp, engaging visual stories through editing and post-production.",
  },
  {
    name: "Priyal",
    role: "Manager & Social Media",
    description: "Manages social media and day-to-day coordination, keeping content moving smoothly from planning to publishing.",
  },
  {
    name: "Yashita",
    role: "In-House Creator",
    description: "Works across content creation and visual storytelling, bringing ideas to life both behind and in front of the camera.",
  },
  {
    name: "Anjali & Shubhankar",
    role: "Interns",
    description: "Support the team across research, content, ideation and everyday creative execution.",
  },
];

const youtubeVideos: YouTubeVideo[] = [
  {
    id: "R4iuX9Y5Zfk",
    title: "You Won't Believe What's Inside MSU Baroda! | Hidden History of Vadodara",
    duration: "25:51",
    category: "Documentary",
    thumbnailUrl: "/assets/youtube-msu-hidden-heritage.png",
    fallbackThumbnailUrl: "/assets/youtube-msu-hidden-heritage.png",
    url: "https://www.youtube.com/watch?v=R4iuX9Y5Zfk",
  },
  {
    id: "DUZ43m2XuV0",
    title: "We Investigated a public library in Gujarat!",
    duration: "4:42",
    category: "Investigation",
    thumbnailUrl: "https://i.ytimg.com/vi/DUZ43m2XuV0/maxresdefault.jpg",
    fallbackThumbnailUrl: "https://i.ytimg.com/vi/DUZ43m2XuV0/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=DUZ43m2XuV0",
  },
  {
    id: "fDH-w7M9NfY",
    title: "3 Outsiders vs. BARODA | The Ultimate Baroda Entrance Exam",
    duration: "30:29",
    category: "Challenge",
    thumbnailUrl: "https://i.ytimg.com/vi/fDH-w7M9NfY/maxresdefault.jpg",
    fallbackThumbnailUrl: "https://i.ytimg.com/vi/fDH-w7M9NfY/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=fDH-w7M9NfY",
  },
  {
    id: "qifDNVwWGrI",
    title: "VADODARA HAS LIVE COMEDY AND IMPROV SHOWS? - VLOG 3",
    duration: "9:41",
    category: "Comedy",
    thumbnailUrl: "https://i.ytimg.com/vi/qifDNVwWGrI/maxresdefault.jpg",
    fallbackThumbnailUrl: "https://i.ytimg.com/vi/qifDNVwWGrI/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=qifDNVwWGrI",
  },
  {
    id: "LBRScnAmva8",
    title: "JALPARIS IN BARODA? - VLOG 2 / Royal Mela 🎡🎠🎪",
    duration: "16:33",
    category: "Vlog",
    thumbnailUrl: "https://i.ytimg.com/vi/LBRScnAmva8/maxresdefault.jpg",
    fallbackThumbnailUrl: "https://i.ytimg.com/vi/LBRScnAmva8/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=LBRScnAmva8",
  },
  {
    id: "D38dDu3CQaM",
    title: "TEAM OUTING DONE RIGHT - VLOG 1 #VlogsFromVadodara",
    duration: "12:16",
    category: "Story",
    thumbnailUrl: "https://i.ytimg.com/vi/D38dDu3CQaM/maxresdefault.jpg",
    fallbackThumbnailUrl: "https://i.ytimg.com/vi/D38dDu3CQaM/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=D38dDu3CQaM",
  },
];

const comments = [
  "Epic 😂😂😂",
  "Chaos",
  "Hahaha lovely",
  "Crazy",
  "Favorite ❤️",
  "Lovely piece guys 🙌",
  "Love this❤️",
  "Gajab!!! 🔥 Keep it up.",
  "Bahut badhiya bhai log",
  "Childhood memories ❤️",
  "Love the content alreadyyyy🥰✨",
];

function MagneticButton({ children, href = "#contact" }: { children: React.ReactNode; href?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  const resetPosition = () => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    if (ref.current) ref.current.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <a
      ref={ref}
      className="magnetic"
      href={href}
      onMouseMove={(event) => {
        const node = ref.current;
        if (!node) return;
        pointerRef.current = { x: event.clientX, y: event.clientY };
        if (frameRef.current) return;
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = 0;
          const rect = node.getBoundingClientRect();
          const x = (pointerRef.current.x - rect.left - rect.width / 2) * 0.18;
          const y = (pointerRef.current.y - rect.top - rect.height / 2) * 0.18;
          node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
      }}
      onMouseLeave={resetPosition}
    >
      {children}
      <ArrowUpRight size={18} />
    </a>
  );
}

function formatMetric(value?: number) {
  if (!value) return "";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return `${value}`;
}

function FeaturedBadge({ category }: { category: string }) {
  return <span className="featured-badge" data-category={category.toLowerCase()}>{category}</span>;
}

function FeaturedStats({ reel }: { reel: FeaturedReel }) {
  const stats = [
    reel.likes ? { icon: Heart, label: `${formatMetric(reel.likes)} Likes` } : null,
    reel.views ? { icon: Eye, label: `${formatMetric(reel.views)} Views` } : null,
    reel.comments ? { icon: MessageCircle, label: `${formatMetric(reel.comments)} Comments` } : null,
  ].filter(Boolean) as Array<{ icon: LucideIcon; label: string }>;

  if (!stats.length) return null;

  return (
    <ul className="featured-stats" aria-label="Reel engagement metrics">
      {stats.map(({ icon: Icon, label }) => (
        <li key={label}>
          <Icon size={15} />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

function AgencyVisual({ visual }: { visual: AgencyStory["visual"] }) {
  const imageSrc = agencyVisualImages[visual];

  if (imageSrc) {
    return (
      <div className={`agency-visual-scene agency-image-scene agency-image-${visual}`}>
        <img className="agency-visual-image" src={imageSrc} alt="" loading="lazy" decoding="async" />
        <span className="agency-banner-aura" />
        <span className="agency-banner-sheen" />
        <span className="agency-banner-particle particle-one" />
        <span className="agency-banner-particle particle-two" />
        <span className="agency-banner-particle particle-three" />
        <span className="agency-banner-orbit orbit-one" />
        <span className="agency-banner-orbit orbit-two" />
      </div>
    );
  }

  if (visual === "influence") {
    return (
      <div className="agency-visual-scene abstract-network">
        <span className="agency-core" />
        {Array.from({ length: 9 }, (_, index) => <span className={`agency-node node-${index + 1}`} key={index} />)}
        {Array.from({ length: 7 }, (_, index) => <span className={`agency-thread thread-${index + 1}`} key={index} />)}
        {Array.from({ length: 4 }, (_, index) => <span className={`agency-pulse pulse-${index + 1}`} key={index} />)}
      </div>
    );
  }

  if (visual === "ugc") {
    return (
      <div className="agency-visual-scene abstract-stack">
        {Array.from({ length: 6 }, (_, index) => <span className={`agency-tile tile-${index + 1}`} key={index} />)}
        {Array.from({ length: 5 }, (_, index) => <span className={`agency-reaction reaction-${index + 1}`} key={index} />)}
      </div>
    );
  }

  if (visual === "meta") {
    return (
      <div className="agency-visual-scene abstract-growth">
        <span className="target-field" />
        {Array.from({ length: 5 }, (_, index) => <span className={`growth-bar growth-${index + 1}`} key={index} />)}
        {Array.from({ length: 4 }, (_, index) => <span className={`growth-ring ring-${index + 1}`} key={index} />)}
      </div>
    );
  }

  if (visual === "writing") {
    return (
      <div className="agency-visual-scene abstract-writing" aria-hidden="true">
        <span className="writing-word word-1">stories</span>
        <span className="writing-word word-2">strategy</span>
        <span className="writing-word word-3">culture</span>
        <span className="writing-word word-4">voice</span>
        <span className="writing-line line-1" />
        <span className="writing-line line-2" />
        <span className="writing-line line-3" />
      </div>
    );
  }

  if (visual === "website") {
    return (
      <div className="agency-visual-scene abstract-layout">
        {Array.from({ length: 8 }, (_, index) => <span className={`layout-block block-${index + 1}`} key={index} />)}
        <span className="layout-cursor" />
      </div>
    );
  }

  if (visual === "social") {
    return (
      <div className="agency-visual-scene abstract-schedule">
        {Array.from({ length: 10 }, (_, index) => <span className={`schedule-block schedule-${index + 1}`} key={index} />)}
        <span className="schedule-axis" />
      </div>
    );
  }

  return (
    <div className="agency-visual-scene abstract-authority">
      <span className="authority-score">87</span>
      {Array.from({ length: 8 }, (_, index) => <span className={`authority-node authority-${index + 1}`} key={index} />)}
      {Array.from({ length: 6 }, (_, index) => <span className={`authority-link authority-link-${index + 1}`} key={index} />)}
    </div>
  );
}

function AgencyServiceCard({ story, index }: { story: AgencyStory; index: number }) {
  const imageSrc = agencyVisualImages[story.visual];

  return (
    <motion.div
      className="agency-gallery-item"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.68, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <article className="agency-gallery-card" aria-label={story.title}>
        <span className="agency-glass-particle particle-one" />
        <span className="agency-glass-particle particle-two" />
        <span className="agency-glass-particle particle-three" />
        <div className="agency-card-art">
          {imageSrc ? <img className="agency-card-image" src={imageSrc} alt={story.title} loading="lazy" decoding="async" /> : null}
        </div>
        <div className="agency-card-tags" aria-hidden="true">
          {story.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="agency-card-title">{story.title}</div>
      </article>
    </motion.div>
  );
}

function AgencyShowcase() {
  return (
    <div className="agency-showcase">
      <div className="agency-showcase-left">
        <div className="agency-services-head">
          <motion.p
            className="section-kicker"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          >
            AGENCY
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.74, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>How We</span>
            <span className="agency-heading-grow">Grow</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            Helping brands, creators, and businesses grow through storytelling, strategy, content, and performance marketing.
          </motion.p>
        </div>
      </div>
      <div className="agency-gallery" aria-label="Agency services">
        {agencyStories.map((story, index) => (
          <AgencyServiceCard story={story} index={index} key={story.title} />
        ))}
      </div>
    </div>
  );
}

function FeaturedOverlay({ reel }: { reel: FeaturedReel }) {
  return (
    <div className="featured-overlay">
      <div className="featured-topline">
        <FeaturedBadge category={reel.category} />
        <Instagram className="featured-instagram" size={20} aria-hidden="true" />
      </div>
      <div className="featured-title-row">
        <h3>{reel.title}</h3>
        <ArrowUpRight className="featured-arrow" size={22} aria-hidden="true" />
      </div>
      <p>{reel.shortDescription}</p>
      <FeaturedStats reel={reel} />
    </div>
  );
}

function FeaturedCard({ reel, index }: { reel: FeaturedReel; index: number }) {
  const disabled = !reel.reelUrl;
  const [imageSrc, setImageSrc] = useState(reel.thumbnailUrl);
  const cardMoveFrameRef = useRef(0);
  const cardPointerRef = useRef({ x: 0, y: 0 });

  return (
    <motion.a
      className={`featured-card ${index < 2 ? "is-hero" : "is-medium"} ${disabled ? "is-disabled" : ""}`}
      href={reel.reelUrl || undefined}
      target={reel.reelUrl ? "_blank" : undefined}
      rel={reel.reelUrl ? "noreferrer" : undefined}
      aria-label={reel.reelUrl ? `Open Instagram reel: ${reel.title}` : `${reel.title} Instagram reel unavailable`}
      aria-disabled={disabled}
      onClick={(event) => {
        if (disabled) event.preventDefault();
      }}
      onMouseMove={(event) => {
        const card = event.currentTarget;
        cardPointerRef.current = { x: event.clientX, y: event.clientY };
        if (cardMoveFrameRef.current) return;
        cardMoveFrameRef.current = requestAnimationFrame(() => {
          cardMoveFrameRef.current = 0;
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--spotlight-x", `${cardPointerRef.current.x - rect.left}px`);
          card.style.setProperty("--spotlight-y", `${cardPointerRef.current.y - rect.top}px`);
        });
      }}
      initial={{ opacity: 0, y: 42, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.68, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <img
        src={imageSrc}
        alt={reel.title}
        loading="lazy"
        onError={() => {
          if (reel.fallbackImageUrl && imageSrc !== reel.fallbackImageUrl) {
            setImageSrc(reel.fallbackImageUrl);
          }
        }}
      />
      <FeaturedOverlay reel={reel} />
    </motion.a>
  );
}

function FeaturedWorkSection() {
  return (
    <section className="work featured-work" id="work" aria-labelledby="featured-work-title">
      <div className="featured-work-head" data-reveal>
        <p className="section-kicker">Featured Work</p>
        <h2 id="featured-work-title">Proof that the city is watching.</h2>
        <p>Real stories. Real people. Real engagement. Every reel captures a different side of Baroda.</p>
      </div>
      <div className="featured-masonry">
        {featuredReels.map((reel, index) => (
          <FeaturedCard reel={reel} index={index} key={`${reel.title}-${reel.reelUrl || index}`} />
        ))}
      </div>
    </section>
  );
}

function YouTubeVideoCard({ video, index }: { video: YouTubeVideo; index: number }) {
  return (
    <motion.a
      className="youtube-video-card"
      href={video.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Watch ${video.title} on YouTube`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.64, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="youtube-thumbnail">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = video.fallbackThumbnailUrl;
          }}
        />
        <span className="youtube-play" aria-hidden="true">
          <Play size={22} fill="currentColor" />
        </span>
        <div className="youtube-video-overlay">
          <span className="youtube-badge">{video.category}</span>
          <h3>{video.title}</h3>
          <time>{video.duration}</time>
        </div>
      </div>
    </motion.a>
  );
}

function YouTubeShowcaseSection() {
  return (
    <section className="youtube-showcase" id="youtube" aria-labelledby="youtube-heading">
      <motion.div
        className="youtube-head"
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.74, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="section-kicker">YOUTUBE</p>
          <h2 id="youtube-heading">We are on Youtube too</h2>
          <p>
            Long-form stories, documentaries, vlogs, satire, and conversations from Vadodara—made with curiosity, humor, and a camera that refuses to look away.
          </p>
        </div>
        <article className="youtube-profile" aria-label="The Baroda Chronicles YouTube channel">
          <div className="youtube-profile-top">
            <img src="/assets/youtube-channel-logo.jpg" alt="The Baroda Chronicles logo" loading="lazy" decoding="async" />
            <div>
              <h3>
                The Baroda Chronicles
                <BadgeCheck size={18} aria-label="Verified" />
              </h3>
              <p>TBC – The Baroda Chronicles</p>
            </div>
          </div>
          <p className="youtube-profile-copy">
            Stories, satire, and sketches about real life. Simple, honest, and sometimes too real.
          </p>
          <div className="youtube-stats" aria-label="Channel stats">
            <span><strong>35</strong> Videos</span>
            <span><strong>17.8K</strong> Views</span>
          </div>
          <div className="youtube-actions">
            <a className="magnetic youtube-primary" href={youtubeChannelUrl} target="_blank" rel="noreferrer">
              <Youtube size={18} />
              Watch on YouTube
            </a>
            <a className="ghost youtube-secondary" href={youtubeChannelUrl} target="_blank" rel="noreferrer">
              View All Videos
              <ArrowUpRight size={17} />
            </a>
          </div>
        </article>
      </motion.div>

      <div className="youtube-video-grid" aria-label="Latest YouTube videos">
        {youtubeVideos.map((video, index) => (
          <YouTubeVideoCard video={video} index={index} key={video.id} />
        ))}
      </div>

      <motion.div
        className="youtube-end"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p>More stories are always on the way.</p>
        <a className="magnetic" href={youtubeChannelUrl} target="_blank" rel="noreferrer">
          Visit YouTube
          <ArrowUpRight size={18} />
        </a>
      </motion.div>
    </section>
  );
}

function App() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorPointRef = useRef({ x: -100, y: -100 });
  const cursorFrameRef = useRef(0);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, -120]);
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
  const blogSlug = currentPath.startsWith("/blog/") ? decodeURIComponent(currentPath.replace("/blog/", "")) : "";
  const activeBlog = blogSlug ? getBlogBySlug(blogSlug) : undefined;

  useEffect(() => {
    return initializeGA4RouteTracking();
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((node) => {
      gsap.fromTo(
        node,
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: node, start: "top 82%", once: true } },
      );
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      cursorPointRef.current = { x: event.clientX - 13, y: event.clientY - 13 };
      if (cursorFrameRef.current) return;
      cursorFrameRef.current = requestAnimationFrame(() => {
        cursorFrameRef.current = 0;
        const cursor = cursorRef.current;
        if (!cursor) return;
        cursor.style.transform = `translate3d(${cursorPointRef.current.x}px, ${cursorPointRef.current.y}px, 0)`;
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(cursorFrameRef.current);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      document.documentElement.style.setProperty("--blog-banner-y", `${window.scrollY}px`);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      {currentPath === "/" ? (
        <SEO
          title="The Baroda Chronicles | Stories, Satire & Creative Production"
          description="TBC - The Baroda Chronicles. Stories, satire, and sketches about real life. Simple, honest, and sometimes too real."
          image="/assets/tbc-logo-official.png"
          url="/"
          keywords={[
            "The Baroda Chronicles",
            "Baroda creative agency",
            "Vadodara stories",
            "social media marketing",
            "reels production",
            "creative production house",
          ]}
        />
      ) : null}
      <motion.div className="progress" style={{ scaleX: progress }} />
      <div className="noise" />
      <div className="cursor" ref={cursorRef} />
      <header className="nav">
        <a href="/" className="brand">
          <img src="/assets/tbc-nav-logo.png" alt="" aria-hidden="true" />
          <span>TBC</span>
        </a>
        <nav>
          <a href="/#work">Work</a>
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      {currentPath === "/blog" ? (
        <BlogPage />
      ) : currentPath === "/about" ? (
        <AboutPage />
      ) : currentPath === "/contact" ? (
        <ContactPage />
      ) : blogSlug && activeBlog ? (
        <BlogPostPage slug={blogSlug} />
      ) : currentPath === "/" ? (
      <main id="top">
        <section className="hero">
          <motion.div className="hero-copy" style={{ y: heroY }}>
            <p className="eyebrow">The Baroda Chronicles / Creative Production House</p>
            <h1>
              Internet culture, filmed with a city-sized <span>side eye.</span>
            </h1>
            <p className="hero-text">
              Reels, films, campaigns, photography, social systems, and strange little ideas that somehow become everyone&apos;s group chat.
            </p>
            <div className="hero-actions">
              <MagneticButton>Make Something Loud</MagneticButton>
              <a className="ghost" href="#work"><Play size={17} /> Watch the proof</a>
            </div>
          </motion.div>
          <div className="hero-stage">
            <VinylTurntable />
          </div>
        </section>

        <section className="about">
          <div className="team-hero" data-reveal>
            <div className="team-intro">
              <p className="section-kicker">About TBC</p>
              <h2>The people behind the <span>stories.</span></h2>
              <p>
                The Baroda Chronicles is powered by a multidisciplinary team that brings together strategy, creativity, technology, production and social media under one roof.
              </p>
            </div>
            <div className="team-photo-card">
              <img src="/assets/tbc-team-photo.jpeg" alt="The Baroda Chronicles team" loading="lazy" />
            </div>
          </div>

          <div className="team-leadership" aria-label="TBC leadership">
            {teamLeads.map((lead) => (
              <article className="team-lead-card" key={lead.name} data-reveal>
                <span>{lead.role}</span>
                <h3>{lead.name}</h3>
                {lead.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>

          <div className="team-grid" aria-label="TBC wider team">
            {teamMembers.map((member) => (
              <article className="team-member-card" key={member.name} data-reveal>
                <span>{member.role}</span>
                <h3>{member.name}</h3>
                <p>{member.description}</p>
              </article>
            ))}
          </div>

          <div className="team-closing" data-reveal>
            <p>
              We operate as a compact, hands-on team where ideas do not pass through endless departments - they are strategised, created, produced and executed in-house.
            </p>
            <strong>Strategy. Stories. Systems. Execution. All under one roof.</strong>
          </div>
        </section>

        <FeaturedWorkSection />

        <section className="agency-services">
          <AgencyShowcase />
        </section>

        <section className="process" data-reveal>
          <p className="section-kicker">Creative Process</p>
          <div className="process-track">
            {["Observe", "Twist", "Shoot", "Edit", "Release"].map((step, index) => (
              <div className="process-step" key={step}>
                <span>0{index + 1}</span>
                <strong>{step}</strong>
                <p>{["Find the tiny truth.", "Make it sharable.", "Keep the texture.", "Sharpen the rhythm.", "Let the city reply."][index]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="social" id="social">
          <div className="section-head" data-reveal>
            <p className="section-kicker">Instagram Highlights</p>
            <h2>A feed that behaves like a living pitch deck.</h2>
          </div>
          <div className="social-collage" data-reveal>
            <img src="/assets/grid.png" alt="The Baroda Chronicles Instagram grid" />
            <div className="story-bubbles">
              <span><Instagram size={16} /> reels</span>
              <span><Heart size={16} /> 1.5k+</span>
              <span><MessageCircle size={16} /> unfiltered</span>
            </div>
          </div>
        </section>

        <section className="community">
          <div className="section-head" data-reveal>
            <p className="section-kicker">Community Love</p>
            <h2>The comment section became part of the show.</h2>
          </div>
          <div className="comment-cloud">
            {comments.map((comment, index) => (
              <motion.div
                className="comment"
                key={comment}
                data-reveal
                animate={{ y: [0, index % 2 ? -12 : 12, 0] }}
                transition={{ duration: 5 + index * 0.25, repeat: Infinity, ease: "easeInOut" }}
              >
                {comment}
              </motion.div>
            ))}
          </div>
        </section>

        <YouTubeShowcaseSection />

        <section className="verified" data-reveal>
          <div>
            <p className="section-kicker">Verified Interactions</p>
            <h2>The city likes us &amp; you will too.</h2>
          </div>
          <div className="verified-grid">
            {[
              ["Chirayu Mistry", "Liked a TBC post", "/assets/chirayu-like.png"],
              ["Radhikaraje Gaekwad", "Liked a TBC post", "/assets/radhikaraje-like.png"],
            ].map(([name, action, image]) => (
              <motion.article className="verified-card" key={name} whileHover={{ y: -8 }}>
                <img src={image} alt={`${name} interaction screenshot`} />
                <div>
                  <h3>{name} <BadgeCheck size={18} /></h3>
                  <p>{action}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="testimonials">
          <article data-reveal>
            <Mic2 size={26} />
            <p>“Simple, honest, and sometimes too real.”</p>
            <span>The brand, accidentally writing the client brief</span>
          </article>
          <article data-reveal>
            <Clapperboard size={26} />
            <p>“If this is the website, imagine the campaign.”</p>
            <span>Future client energy</span>
          </article>
        </section>

        <section className="contact" id="contact" data-reveal>
          <p className="section-kicker">Contact</p>
          <h2>Bring us a brand, a venue, a half-formed joke, or a very serious launch problem.</h2>
          <MagneticButton href="mailto:info@thebarodachronicles.com">info@thebarodachronicles.com</MagneticButton>
          <div className="contact-links" aria-label="Contact The Baroda Chronicles">
            <a className="contact-link" href="mailto:info@thebarodachronicles.com">
              <span className="contact-link-icon" aria-hidden="true"><Mail size={20} /></span>
              <span>
                <strong>Email</strong>
                <small>info@thebarodachronicles.com</small>
              </span>
            </a>
            <a
              className="contact-link"
              href="https://www.instagram.com/the.baroda.chronicles/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="contact-link-icon" aria-hidden="true"><Instagram size={20} /></span>
              <span>
                <strong>Instagram</strong>
                <small>@the.baroda.chronicles</small>
              </span>
            </a>
          </div>
        </section>
      </main>
      ) : (
        <NotFoundPage path={currentPath} />
      )}

      <footer>
        <strong>The Baroda Chronicles</strong>
        <nav aria-label="Footer navigation">
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
          <a href="/contact">Contact</a>
        </nav>
        <span>Films / Reels / Campaigns / Social chaos / 20-26</span>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
    <Analytics />
    <SpeedInsights />
  </HelmetProvider>,
);
