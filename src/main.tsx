import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
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
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import instagramPosts from "./data/tbc_instagram_posts_full.json";
import { SEO } from "./components/SEO";
import { BlogPage } from "./pages/Blog";
import { BlogPostPage } from "./pages/BlogPost";
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

const youtubeVideos: YouTubeVideo[] = [
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

const TURNTABLE_PLAYLIST = [
  { title: "Loksii No Copyright Music 01", src: "/assets/loksii-no-copyright-music-211881.mp3" },
  { title: "Loksii No Copyright Music 02", src: "/assets/loksii-no-copyright-music-211881.mp3" },
  { title: "Loksii No Copyright Music 03", src: "/assets/loksii-no-copyright-music-211881.mp3" },
  { title: "Loksii No Copyright Music 04", src: "/assets/loksii-no-copyright-music-211881.mp3" },
] as const;
const TURNTABLE_VOLUME_TICK_SOURCE = "/assets/volume-fader-tick.wav";
const TURNTABLE_VOLUME_STORAGE_KEY = "tbc-turntable-volume";
const TONEARM_REST = { x: 0, y: 0, z: 44, angle: 22 };
const TONEARM_OUTER_GROOVE = { x: -7, y: 10, z: 42, angle: 21 };
const TONEARM_INNER_GROOVE = { x: -12, y: 14, z: 42, angle: 25 };

const interpolateTonearm = (progress: number) => {
  const clamped = Math.max(0, Math.min(1, progress));
  return {
    x: TONEARM_OUTER_GROOVE.x + (TONEARM_INNER_GROOVE.x - TONEARM_OUTER_GROOVE.x) * clamped,
    y: TONEARM_OUTER_GROOVE.y + (TONEARM_INNER_GROOVE.y - TONEARM_OUTER_GROOVE.y) * clamped,
    z: TONEARM_OUTER_GROOVE.z,
    angle: TONEARM_OUTER_GROOVE.angle + (TONEARM_INNER_GROOVE.angle - TONEARM_OUTER_GROOVE.angle) * clamped,
  };
};

function VinylTurntable() {
  const deckRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<HTMLDivElement>(null);
  const tonearmRef = useRef<HTMLDivElement>(null);
  const volumeTrackRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioFadeRef = useRef(0);
  const audioGainRef = useRef(0);
  const uiAudioContextRef = useRef<AudioContext | null>(null);
  const volumeTickRefs = useRef<HTMLAudioElement[]>([]);
  const volumeTickIndexRef = useRef(0);
  const lastVolumeTickTimeRef = useRef(0);
  const animationRef = useRef(0);
  const stageMoveFrameRef = useRef(0);
  const stagePointerRef = useRef({ x: 0, y: 0 });
  const isTurntableVisibleRef = useRef(true);
  const previousTimeRef = useRef(0);
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const targetSpeedRef = useRef(198);
  const momentumRef = useRef(0);
  const tonearmXRef = useRef(TONEARM_REST.x);
  const tonearmYRef = useRef(TONEARM_REST.y);
  const tonearmZRef = useRef(TONEARM_REST.z);
  const tonearmAngleRef = useRef(TONEARM_REST.angle);
  const tonearmResetUntilRef = useRef(0);
  const trackAdvanceTimeoutRef = useRef(0);
  const draggingRef = useRef(false);
  const volumeDraggingRef = useRef(false);
  const hoveredRef = useRef(false);
  const lastDragAngleRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const [isPowered, setIsPowered] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDraggingRecord, setIsDraggingRecord] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [indicatorPulse, setIndicatorPulse] = useState(0);
  const [volume, setVolume] = useState(() => {
    const savedVolume = window.localStorage.getItem(TURNTABLE_VOLUME_STORAGE_KEY);
    const parsedVolume = savedVolume ? Number(savedVolume) : 75;
    return Number.isFinite(parsedVolume) ? Math.max(0, Math.min(100, parsedVolume)) : 75;
  });
  const isPoweredRef = useRef(true);
  const isPlayingRef = useRef(true);
  const trackIndexRef = useRef(0);
  const volumeRef = useRef(volume);
  const lastVolumeTickValueRef = useRef(volume);

  const setTurntableHovered = (hovered: boolean) => {
    if (hoveredRef.current === hovered) return;
    hoveredRef.current = hovered;
    deckRef.current?.classList.toggle("is-hovered", hovered);
  };

  const setVolumeVisual = (nextVolume: number) => {
    const deck = deckRef.current;
    if (!deck) return;
    deck.style.setProperty("--volume-fill", `${nextVolume * 0.9}%`);
    deck.style.setProperty("--volume-y", `${95 - nextVolume * 0.9}%`);
  };

  const applyVolume = (nextVolume: number, commitState = false, forceTick = false) => {
    if (nextVolume === volumeRef.current && !commitState) return;
    playVolumeTick(nextVolume, forceTick);
    volumeRef.current = nextVolume;
    setVolumeVisual(nextVolume);

    const audio = audioRef.current;
    if (audio && isPoweredRef.current && isPlayingRef.current) {
      const nextAudioVolume = (nextVolume / 100) * 0.28;
      audio.volume = Math.max(0, Math.min(1, nextAudioVolume));
      audioGainRef.current = audio.volume;
    }

    if (commitState) setVolume(nextVolume);
  };

  useEffect(() => {
    isPoweredRef.current = isPowered;
  }, [isPowered]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    trackIndexRef.current = trackIndex;
  }, [trackIndex]);

  useEffect(() => {
    volumeRef.current = volume;
    setVolumeVisual(volume);
    window.localStorage.setItem(TURNTABLE_VOLUME_STORAGE_KEY, String(volume));
  }, [volume]);

  const playUiSound = (type: "power-on" | "power-off" | "button" | "volume") => {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = uiAudioContextRef.current ?? new AudioContextClass();
    uiAudioContextRef.current = context;
    if (context.state === "suspended") context.resume().catch(() => undefined);

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const frequency = type === "power-on" ? 920 : type === "power-off" ? 360 : type === "volume" ? 760 : 620;

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === "volume" ? 0.012 : 0.018, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  };

  const playVolumeTick = (nextVolume: number, force = false) => {
    const now = performance.now();
    const changed = nextVolume !== volumeRef.current;
    const movedEnough = force || Math.abs(nextVolume - lastVolumeTickValueRef.current) >= 3;
    const waitedEnough = force || now - lastVolumeTickTimeRef.current >= 85;
    if (!changed || !movedEnough || !waitedEnough) return;

    const pool = volumeTickRefs.current;
    if (!pool.length) return;

    const tick = pool[volumeTickIndexRef.current % pool.length];
    volumeTickIndexRef.current += 1;
    tick.pause();
    tick.currentTime = 0;
    tick.muted = false;
    tick.volume = Math.max(0.035, Math.min(0.1, (Math.max(nextVolume, 18) / 100) * 0.11));
    tick.play().catch(() => undefined);

    lastVolumeTickValueRef.current = nextVolume;
    lastVolumeTickTimeRef.current = now;
  };

  const fadeAudio = (targetVolume: number, duration: number, onComplete?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;

    const startVolume = audioGainRef.current;
    const startedAt = performance.now();

    cancelAnimationFrame(audioFadeRef.current);

    const fade = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVolume = startVolume + (targetVolume - startVolume) * eased;
      audio.volume = Math.max(0, Math.min(1, nextVolume));
      audioGainRef.current = audio.volume;

      if (progress < 1) {
        audioFadeRef.current = requestAnimationFrame(fade);
        return;
      }

      onComplete?.();
    };

    audioFadeRef.current = requestAnimationFrame(fade);
  };

  useEffect(() => {
    const audio = new Audio(TURNTABLE_PLAYLIST[0].src);
    audio.loop = false;
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;

    const handleEnded = () => {
      tonearmResetUntilRef.current = performance.now() + 620;
      targetSpeedRef.current = 0;
      isPlayingRef.current = false;
      setIsPlaying(false);
      window.clearTimeout(trackAdvanceTimeoutRef.current);
      trackAdvanceTimeoutRef.current = window.setTimeout(() => {
        trackIndexRef.current = (trackIndexRef.current + 1) % TURNTABLE_PLAYLIST.length;
        setTrackIndex(trackIndexRef.current);
        setIndicatorPulse((pulse) => pulse + 1);
        setIsPlaying(true);
        isPlayingRef.current = true;
        targetSpeedRef.current = isPoweredRef.current ? 198 : 0;
      }, 620);
    };

    audio.addEventListener("ended", handleEnded);

    volumeTickRefs.current = Array.from({ length: 4 }, () => {
      const tick = new Audio(TURNTABLE_VOLUME_TICK_SOURCE);
      tick.preload = "auto";
      tick.volume = 0.035;
      tick.load();
      return tick;
    });

    return () => {
      cancelAnimationFrame(audioFadeRef.current);
      window.clearTimeout(trackAdvanceTimeoutRef.current);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audioRef.current = null;
      volumeTickRefs.current.forEach((tick) => tick.pause());
      volumeTickRefs.current = [];
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const shouldPlay = isPowered && isPlaying;
    const targetVolume = shouldPlay ? (volume / 100) * 0.28 : 0;
    const duration = shouldPlay && audio.paused ? 1600 : shouldPlay ? 220 : 1200;

    if (shouldPlay) {
      const playback = audio.play();
      if (playback) playback.catch(() => undefined);
    }

    fadeAudio(targetVolume, duration, () => {
      if (!shouldPlay) audio.pause();
    });
  }, [isPowered, isPlaying, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = TURNTABLE_PLAYLIST[trackIndex].src;
    audio.currentTime = 0;
    audio.load();
    audio.volume = 0;
    audioGainRef.current = 0;

    if (isPoweredRef.current && isPlayingRef.current) {
      const playback = audio.play();
      if (playback) playback.catch(() => undefined);
      fadeAudio((volumeRef.current / 100) * 0.28, 900);
    }
  }, [trackIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isTurntableVisibleRef.current = entry.isIntersecting;
        previousTimeRef.current = 0;
      },
      { rootMargin: "160px" },
    );

    if (deckRef.current) observer.observe(deckRef.current);

    const handleVisibilityChange = () => {
      isTurntableVisibleRef.current = document.visibilityState === "visible";
      previousTimeRef.current = 0;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const tick = (time: number) => {
      const dt = previousTimeRef.current ? Math.min((time - previousTimeRef.current) / 1000, 0.04) : 0.016;
      previousTimeRef.current = time;

      const shouldSpin = isPoweredRef.current && isPlayingRef.current;
      const baseSpeed = shouldSpin ? targetSpeedRef.current : 0;
      const dragMomentum = shouldSpin ? momentumRef.current : 0;
      speedRef.current += (baseSpeed - speedRef.current) * 0.035;
      if (!shouldSpin && Math.abs(speedRef.current) < 1.8) speedRef.current = 0;

      if (!draggingRef.current) {
        angleRef.current += (speedRef.current + dragMomentum) * dt;
        momentumRef.current *= shouldSpin ? 0.965 : 0.92;
        if (Math.abs(momentumRef.current) < 2) momentumRef.current = 0;
      }

      if (recordRef.current && isTurntableVisibleRef.current) {
        recordRef.current.style.transform = `rotate(${angleRef.current}deg) translateZ(0)`;
        recordRef.current.style.setProperty("--record-angle", `${angleRef.current % 360}deg`);
      }

      const audio = audioRef.current;
      const duration = audio?.duration ?? 0;
      const audioProgress = Number.isFinite(duration) && duration > 0 ? (audio?.currentTime ?? 0) / duration : 0;
      const shouldResetTonearm = !isPoweredRef.current || time < tonearmResetUntilRef.current;
      const targetTonearm = shouldResetTonearm ? TONEARM_REST : interpolateTonearm(audioProgress);
      const ease = shouldResetTonearm ? 0.09 : isPlayingRef.current ? 0.045 : 0.08;
      tonearmXRef.current += (targetTonearm.x - tonearmXRef.current) * ease;
      tonearmYRef.current += (targetTonearm.y - tonearmYRef.current) * ease;
      tonearmZRef.current += (targetTonearm.z - tonearmZRef.current) * ease;
      tonearmAngleRef.current += (targetTonearm.angle - tonearmAngleRef.current) * ease;

      if (tonearmRef.current && isTurntableVisibleRef.current) {
        tonearmRef.current.style.transform = `translate3d(${tonearmXRef.current.toFixed(2)}px, ${tonearmYRef.current.toFixed(2)}px, ${tonearmZRef.current.toFixed(2)}px) rotate(${tonearmAngleRef.current.toFixed(3)}deg)`;
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationRef.current);
      cancelAnimationFrame(stageMoveFrameRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  const angleFromPointer = (event: React.PointerEvent<HTMLElement>) => {
    const record = recordRef.current;
    if (!record) return 0;
    const rect = record.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    return Math.atan2(y, x) * (180 / Math.PI);
  };

  const normalizeDelta = (delta: number) => {
    if (delta > 180) return delta - 360;
    if (delta < -180) return delta + 360;
    return delta;
  };

  const updateStageFromPointer = () => {
    const deck = deckRef.current;
    const record = recordRef.current;
    if (!deck || !record) return;
    if (!isPoweredRef.current) {
      targetSpeedRef.current = 0;
      setTurntableHovered(false);
      deck.style.setProperty("--tilt-x", "0deg");
      deck.style.setProperty("--tilt-y", "0deg");
      deck.style.setProperty("--magnet-x", "0px");
      deck.style.setProperty("--magnet-y", "0px");
      deck.style.setProperty("--spot-x", "50%");
      deck.style.setProperty("--spot-y", "50%");
      return;
    }

    const { x: clientX, y: clientY } = stagePointerRef.current;
    const deckRect = deck.getBoundingClientRect();
    const x = (clientX - deckRect.left) / deckRect.width - 0.5;
    const y = (clientY - deckRect.top) / deckRect.height - 0.5;
    deck.style.setProperty("--tilt-x", `${(-y * 8).toFixed(2)}deg`);
    deck.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);
    deck.style.setProperty("--magnet-x", `${(x * 12).toFixed(2)}px`);
    deck.style.setProperty("--magnet-y", `${(y * 12).toFixed(2)}px`);
    deck.style.setProperty("--spot-x", `${((x + 0.5) * 100).toFixed(2)}%`);
    deck.style.setProperty("--spot-y", `${((y + 0.5) * 100).toFixed(2)}%`);

    const recordRect = record.getBoundingClientRect();
    const dx = clientX - (recordRect.left + recordRect.width / 2);
    const dy = clientY - (recordRect.top + recordRect.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const proximity = Math.max(0, 1 - distance / (recordRect.width * 0.85));
    targetSpeedRef.current = isPoweredRef.current ? 198 + proximity * 150 : 0;
    setTurntableHovered(isPoweredRef.current && proximity > 0.08);
  };

  const handleStageMove = (event: React.PointerEvent<HTMLDivElement>) => {
    stagePointerRef.current = { x: event.clientX, y: event.clientY };
    if (stageMoveFrameRef.current) return;
    stageMoveFrameRef.current = requestAnimationFrame(() => {
      stageMoveFrameRef.current = 0;
      updateStageFromPointer();
    });
  };

  const handleStageLeave = () => {
    cancelAnimationFrame(stageMoveFrameRef.current);
    stageMoveFrameRef.current = 0;
    targetSpeedRef.current = isPoweredRef.current ? 198 : 0;
    setTurntableHovered(false);
    if (deckRef.current) {
      deckRef.current.style.setProperty("--tilt-x", "0deg");
      deckRef.current.style.setProperty("--tilt-y", "0deg");
      deckRef.current.style.setProperty("--magnet-x", "0px");
      deckRef.current.style.setProperty("--magnet-y", "0px");
      deckRef.current.style.setProperty("--spot-x", "50%");
      deckRef.current.style.setProperty("--spot-y", "50%");
    }
  };

  const handleRecordDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPoweredRef.current) return;
    draggingRef.current = true;
    lastDragAngleRef.current = angleFromPointer(event);
    lastDragTimeRef.current = performance.now();
    momentumRef.current = 0;
    setIsDraggingRecord(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleRecordMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !isPoweredRef.current) return;
    const currentAngle = angleFromPointer(event);
    const now = performance.now();
    const delta = normalizeDelta(currentAngle - lastDragAngleRef.current);
    const dt = Math.max(now - lastDragTimeRef.current, 16);
    angleRef.current += delta;
    momentumRef.current = (delta / dt) * 1000;
    lastDragAngleRef.current = currentAngle;
    lastDragTimeRef.current = now;
  };

  const handleRecordUp = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    setIsDraggingRecord(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const togglePower = () => {
    playUiSound(isPoweredRef.current ? "power-off" : "power-on");
    setIsPowered((powered) => {
      const next = !powered;
      isPoweredRef.current = next;
      if (next) {
        setIsPlaying(true);
        isPlayingRef.current = true;
        targetSpeedRef.current = 198;
      } else {
        tonearmResetUntilRef.current = performance.now() + 620;
        targetSpeedRef.current = 0;
        setTurntableHovered(false);
      }
      return next;
    });
  };

  const togglePlayback = () => {
    if (!isPoweredRef.current) return;
    playUiSound("button");
    setIsPlaying((playing) => {
      const next = !playing;
      isPlayingRef.current = next;
      targetSpeedRef.current = next ? 198 : 0;
      return next;
    });
  };

  const changeTrack = (direction: 1 | -1) => {
    if (!isPoweredRef.current) return;
    playUiSound("button");
    tonearmResetUntilRef.current = performance.now() + 520;
    window.clearTimeout(trackAdvanceTimeoutRef.current);

    const nextIndex = (trackIndexRef.current + direction + TURNTABLE_PLAYLIST.length) % TURNTABLE_PLAYLIST.length;
    const audio = audioRef.current;
    const switchTrack = () => {
      tonearmResetUntilRef.current = performance.now() + 520;
      trackIndexRef.current = nextIndex;
      setTrackIndex(nextIndex);
      setIndicatorPulse((pulse) => pulse + 1);
      setIsPlaying(true);
      isPlayingRef.current = true;
      targetSpeedRef.current = 198;
    };

    if (audio && !audio.paused) {
      fadeAudio(0, 420, switchTrack);
      return;
    }

    switchTrack();
  };

  const setVolumeFromClientY = (clientY: number) => {
    const track = volumeTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const next = Math.round(Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height)) * 100);
    applyVolume(next);
  };

  const handleVolumeDown = (event: React.PointerEvent<HTMLDivElement>) => {
    volumeDraggingRef.current = true;
    setIsDraggingVolume(true);
    setVolumeFromClientY(event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleVolumeMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!volumeDraggingRef.current) return;
    setVolumeFromClientY(event.clientY);
  };

  const handleVolumeUp = (event: React.PointerEvent<HTMLDivElement>) => {
    volumeDraggingRef.current = false;
    setIsDraggingVolume(false);
    setVolume(volumeRef.current);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleVolumeWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    const next = Math.max(0, Math.min(100, volumeRef.current + direction * 5));
    applyVolume(next, true, true);
  };

  const changeVolume = (delta: number) => {
    const next = Math.max(0, Math.min(100, volumeRef.current + delta));
    applyVolume(next, true, true);
  };

  const handleTurntableKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".premium-volume")) return;

    if (event.key === " ") {
      event.preventDefault();
      togglePlayback();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      changeTrack(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      changeTrack(1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      changeVolume(5);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      changeVolume(-5);
    }
  };

  const isPlaybackActive = isPowered && isPlaying;

  return (
    <div
      className={`premium-turntable ${isPlaybackActive || isDraggingRecord ? "is-playing" : ""} ${isPowered ? "is-powered" : "is-off"} ${isDraggingRecord ? "is-scrubbing" : ""} ${isDraggingVolume ? "is-volume-dragging" : ""}`}
      onPointerMove={handleStageMove}
      onPointerLeave={handleStageLeave}
      onKeyDown={handleTurntableKeyDown}
      ref={deckRef}
      tabIndex={0}
      aria-label="Interactive TBC vinyl turntable"
      style={{
        "--volume-fill": `${volume * 0.9}%`,
        "--volume-y": `${95 - volume * 0.9}%`,
      } as React.CSSProperties}
    >
      <div className="premium-turntable-glow" aria-hidden="true" />
      <div className="premium-turntable-body">
        <div className="premium-power-control">
          <div className="premium-power-arc" aria-hidden="true" />
          <span>OFF</span>
          <button className="premium-knob premium-power-knob" type="button" onClick={togglePower} aria-pressed={isPowered} aria-label={isPowered ? "Turn power off" : "Turn power on"}>
            <i />
          </button>
          <span>ON</span>
        </div>

        <div
          className="premium-record"
          onPointerDown={handleRecordDown}
          onPointerMove={handleRecordMove}
          onPointerUp={handleRecordUp}
          onPointerCancel={handleRecordUp}
          ref={recordRef}
          role="img"
          aria-label="Spinning vinyl record with TBC logo"
        >
          <div className="premium-record-reflection" />
          <div className="premium-record-label">
            <div className="premium-tbc-logo">
              <img src="/assets/tbc-logo-official.png" alt="TBC logo" draggable="false" />
            </div>
          </div>
          <div className="premium-spindle" />
        </div>

        <div className="premium-tonearm-base" aria-hidden="true">
          <div className="premium-tonearm-pivot" />
          <div className="premium-tonearm" ref={tonearmRef}>
            <span className="premium-tonearm-counterweight" />
            <span className="premium-tonearm-head" />
          </div>
        </div>

        <div
          className="premium-volume"
          role="slider"
          tabIndex={0}
          aria-label="Turntable volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={volume}
          onPointerDown={handleVolumeDown}
          onPointerMove={handleVolumeMove}
          onPointerUp={handleVolumeUp}
          onPointerCancel={handleVolumeUp}
          onWheel={handleVolumeWheel}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowRight") {
              applyVolume(Math.min(100, volumeRef.current + 5), true, true);
            }
            if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
              applyVolume(Math.max(0, volumeRef.current - 5), true, true);
            }
            if (event.key === "Home") {
              applyVolume(0, true, true);
            }
            if (event.key === "End") {
              applyVolume(100, true, true);
            }
          }}
        >
          <div className="premium-volume-scale" aria-hidden="true">
            {[100, 75, 50, 25, 0].map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
          <div className="premium-volume-track" ref={volumeTrackRef} aria-hidden="true">
            <span className="premium-volume-fill" />
            <span className="premium-volume-thumb" />
            {Array.from({ length: 9 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
          <strong>VOLUME</strong>
          <div className="premium-playback-controls" aria-label="Playlist controls">
            <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => {
              event.stopPropagation();
              changeTrack(-1);
            }} aria-label="Previous track" disabled={!isPowered}>
              <SkipBack size={14} fill="currentColor" />
            </button>
            <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => {
              event.stopPropagation();
              togglePlayback();
            }} aria-label={isPlaybackActive ? "Pause music" : "Play music"} disabled={!isPowered}>
              {isPlaybackActive ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
            </button>
            <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => {
              event.stopPropagation();
              changeTrack(1);
            }} aria-label="Next track" disabled={!isPowered}>
              <SkipForward size={14} fill="currentColor" />
            </button>
          </div>
          <div className="premium-playlist-indicators" aria-label={`Track ${trackIndex + 1} of ${TURNTABLE_PLAYLIST.length}`}>
            {TURNTABLE_PLAYLIST.map((track, index) => (
              <span
                key={`${track.title}-${index === trackIndex ? indicatorPulse : 0}`}
                className={index === trackIndex ? "is-active" : ""}
                data-pulse={index === trackIndex ? indicatorPulse : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
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
          <h2 id="youtube-heading">Stories worth watching.</h2>
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
          <a href="/#social">Social Proof</a>
          <a href="/blog">Blog</a>
          <a href="/#contact">Contact</a>
        </nav>
      </header>

      {currentPath === "/blog" ? (
        <BlogPage />
      ) : blogSlug ? (
        <BlogPostPage slug={blogSlug} />
      ) : (
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

        <section className="about" data-reveal>
          <div className="about-media">
            <img src="/assets/are-you-from-baroda.png" alt="Are you from Baroda reel by The Baroda Chronicles" loading="lazy" />
            <div className="about-media-caption">
              <Play size={16} />
              <span>29.6K people heard the question.</span>
            </div>
          </div>
          <div className="about-copy">
            <p className="section-kicker">About</p>
            <h2>TBC makes Baroda feel like a frame, a punchline, a memory, and a brand world at the same time.</h2>
            <p>
              We turn local texture into cinematic internet objects: the cutting chai, the meet-up poster, the comment that refuses to behave, the reel that starts as a joke and ends as a campaign strategy.
            </p>
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

        <YouTubeShowcaseSection />

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

        <section className="verified" data-reveal>
          <div>
            <p className="section-kicker">Verified Interactions</p>
            <h2>The city notices the work.</h2>
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
          <MagneticButton href="mailto:tbcstudio99@gmail.com">tbcstudio99@gmail.com</MagneticButton>
          <div className="contact-links" aria-label="Contact The Baroda Chronicles">
            <a className="contact-link" href="mailto:tbcstudio99@gmail.com">
              <span className="contact-link-icon" aria-hidden="true"><Mail size={20} /></span>
              <span>
                <strong>Email</strong>
                <small>tbcstudio99@gmail.com</small>
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
      )}

      <footer>
        <strong>The Baroda Chronicles</strong>
        <span>Films / Reels / Campaigns / Social chaos / 20-26</span>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
