/**
 * TBC Vinyl Turntable — music player for The Baroda Chronicles website.
 *
 * Visual design: the final approved reference (cream deck, large record + tonearm, power knob
 * top-left, tall volume panel on the right, round black Previous / Next buttons bottom-left).
 * There is no visible Play/Pause button in the approved design, so the RECORD itself is the
 * play/pause control: tap/click it, or focus it and press Space/Enter (exposed to assistive tech
 * as a "Play music" / "Pause music" button). Dragging the record still scratches it.
 *
 * The deck initializes powered on and attempts playback; if the browser blocks autoplay, the
 * UI falls back to an honest paused state. Playback can also start from tapping the record,
 * Previous/Next, Space on the focused deck, or switching the power knob back on.
 *
 * Playback engine: the site's existing logic (single HTMLAudioElement, fades, playlist order,
 * auto-advance on track end, volume ×0.28 gain, volume persisted to localStorage,
 * rAF-driven record spin + tonearm that follows track progress).
 *
 * Requires: react >= 18, lucide-react (SkipBack, SkipForward), ./VinylTurntable.css.
 */
import React, { useEffect, useRef, useState } from "react";
import { SkipBack, SkipForward } from "lucide-react";
import "./VinylTurntable.css";

export type TurntableTrack = {
  readonly id: string;
  readonly title: string;
  readonly src: string;
};

export type VinylTurntableProps = {
  /** Tracks in play order. Read once on mount. Defaults to the TBC website playlist. */
  playlist?: readonly TurntableTrack[];
  /** Short click played while the volume fader moves. */
  volumeTickSrc?: string;
  /** Image shown on the record label. */
  logoSrc?: string;
  /** localStorage key used to remember the volume between visits. */
  volumeStorageKey?: string;
};

/** The TBC website playlist — same files and order as before (served from /public/assets). */
export const TURNTABLE_PLAYLIST: readonly TurntableTrack[] = [
  { id: "loksii-no-copyright-music", title: "Loksii No Copyright Music", src: "/assets/loksii-no-copyright-music-211881.mp3" },
  { id: "funk-rock-instrumental", title: "Funk Rock Instrumental", src: "/assets/lyrium-funk-rock-instrumental.mp3" },
  { id: "tbc-audio", title: "TBC Audio", src: "/assets/tbc-whatsapp-audio.mp3" },
];
export const TURNTABLE_VOLUME_TICK_SOURCE = "/assets/volume-fader-tick.wav";
export const TURNTABLE_LOGO_SOURCE = "/assets/tbc-logo-official.png";
export const TURNTABLE_VOLUME_STORAGE_KEY = "tbc-turntable-volume";

/** Music volume = fader % × this gain (unchanged from the site). */
const MUSIC_GAIN = 0.28;
/** Platter speed in degrees per second while playing. */
const PLAY_SPEED = 198;
/** A press on the record shorter than this, moving less than TAP_SLOP px, counts as a tap (play/pause). */
const TAP_MAX_MS = 450;
const TAP_SLOP = 8;

/*
 * Tonearm angles (degrees, clockwise from vertical, rotating about the pivot).
 * Geometry matches the reference: at REST the stylus sits just off the record's edge;
 * while playing it travels from the outer groove to the inner groove over the track.
 */
const TONEARM_REST = { z: 52, angle: 9 };
const TONEARM_OUTER_GROOVE = { z: 42, angle: 26.5 };
const TONEARM_INNER_GROOVE = { z: 42, angle: 33.5 };

const interpolateTonearm = (progress: number) => {
  const clamped = Math.max(0, Math.min(1, progress));
  return {
    z: TONEARM_OUTER_GROOVE.z,
    angle: TONEARM_OUTER_GROOVE.angle + (TONEARM_INNER_GROOVE.angle - TONEARM_OUTER_GROOVE.angle) * clamped,
  };
};

const readStoredVolume = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStoredVolume = (key: string, value: number) => {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* storage unavailable (private mode / blocked) — volume simply isn't remembered */
  }
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function VinylTurntable({
  playlist = TURNTABLE_PLAYLIST,
  volumeTickSrc = TURNTABLE_VOLUME_TICK_SOURCE,
  logoSrc = TURNTABLE_LOGO_SOURCE,
  volumeStorageKey = TURNTABLE_VOLUME_STORAGE_KEY,
}: VinylTurntableProps = {}) {
  // Read once at mount, like the original module-level constants.
  const tracks = useRef(playlist).current;
  const deckRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<HTMLDivElement>(null);
  const tonearmRef = useRef<HTMLDivElement>(null);
  const volumeTrackRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioFadeRef = useRef(0);
  const audioGainRef = useRef(0);
  /** Set when playback (re)starts so the next fade is the long 1.6s fade-in. */
  const needsFadeInRef = useRef(false);
  const uiAudioContextRef = useRef<AudioContext | null>(null);
  const volumeTickRefs = useRef<HTMLAudioElement[]>([]);
  const volumeTickIndexRef = useRef(0);
  const lastVolumeTickTimeRef = useRef(0);
  const animationRef = useRef(0);
  const stageMoveFrameRef = useRef(0);
  const stagePointerRef = useRef({ x: 0, y: 0 });
  const isTurntableVisibleRef = useRef(true);
  const reducedMotionRef = useRef(prefersReducedMotion());
  const previousTimeRef = useRef(0);
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const targetSpeedRef = useRef(0);
  const momentumRef = useRef(0);
  // Starts resting on the outer groove, as in the reference, ready to play.
  const tonearmZRef = useRef(TONEARM_OUTER_GROOVE.z);
  const tonearmAngleRef = useRef(TONEARM_OUTER_GROOVE.angle);
  const tonearmResetUntilRef = useRef(0);
  const trackAdvanceTimeoutRef = useRef(0);
  const draggingRef = useRef(false);
  const volumeDraggingRef = useRef(false);
  const hoveredRef = useRef(false);
  const lastDragAngleRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const recordPressRef = useRef<{ x: number; y: number; t: number; moved: boolean } | null>(null);
  const [isPowered, setIsPowered] = useState(true);
  // Start in the ON/playback-intent state. If the browser blocks autoplay,
  // handlePlayFailure immediately returns the UI to an honest paused state.
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDraggingRecord, setIsDraggingRecord] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [indicatorPulse, setIndicatorPulse] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [volume, setVolume] = useState(() => {
    const savedVolume = readStoredVolume(volumeStorageKey);
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

  // Fill and thumb use the same 0–100% scale as the printed labels, so "50" lines up with 50.
  const setVolumeVisual = (nextVolume: number) => {
    const deck = deckRef.current;
    if (!deck) return;
    deck.style.setProperty("--volume-fill", `${nextVolume}%`);
    deck.style.setProperty("--volume-y", `${100 - nextVolume}%`);
  };

  const applyVolume = (nextVolume: number, commitState = false, forceTick = false) => {
    if (nextVolume === volumeRef.current && !commitState) return;
    playVolumeTick(nextVolume, forceTick);
    volumeRef.current = nextVolume;
    setVolumeVisual(nextVolume);

    const audio = audioRef.current;
    if (audio && isPoweredRef.current && isPlayingRef.current) {
      // The listener is setting the level directly: stop any fade that would overwrite it.
      cancelAnimationFrame(audioFadeRef.current);
      needsFadeInRef.current = false;
      audio.volume = Math.max(0, Math.min(1, (nextVolume / 100) * MUSIC_GAIN));
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
    writeStoredVolume(volumeStorageKey, volume);
  }, [volume]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = query.matches;
    };
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  const playUiSound = (type: "power-on" | "power-off" | "button" | "volume") => {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
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
    } catch {
      /* UI click sounds are decorative — ignore audio-context failures */
    }
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

  /** Put the UI into the "stopped" state without touching the power switch. */
  const markStopped = () => {
    isPlayingRef.current = false;
    targetSpeedRef.current = 0;
    setIsPlaying(false);
  };

  const markPlaying = () => {
    if (!isPoweredRef.current || !isPlayingRef.current) return;
    isPlayingRef.current = true;
    targetSpeedRef.current = PLAY_SPEED;
    setIsPlaying(true);
    setStatusMessage("");
  };

  /**
   * audio.play() can be refused (browser autoplay policy) or fail (bad/missing file).
   * Instead of showing a spinning record with no sound, fall back to the paused state
   * so the record, tonearm and Play/Pause icon always match what is actually audible.
   */
  const handlePlayFailure = (error: unknown) => {
    const name = (error as { name?: string } | null)?.name ?? "";
    if (name === "AbortError") return; // play() superseded by a pause/source change — expected
    markStopped();
    if (name !== "NotAllowedError") {
      setStatusMessage(`Couldn't play “${tracks[trackIndexRef.current].title}”. Try again or skip to another song.`);
    }
  };

  /** Start the element. Called directly inside click handlers so it counts as a user gesture (Safari/iOS). */
  const startAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.error) audio.load(); // retry a track that previously failed to load
    needsFadeInRef.current = true;
    const playback = audio.play();
    if (playback) playback.then(markPlaying).catch(handlePlayFailure);
    else markPlaying();
  };

  useEffect(() => {
    const audio = new Audio(tracks[0].src);
    audio.loop = false;
    audio.preload = "metadata";
    audio.volume = 0;
    audioRef.current = audio;

    const handleEnded = () => {
      tonearmResetUntilRef.current = performance.now() + 620;
      targetSpeedRef.current = 0;
      isPlayingRef.current = false;
      setIsPlaying(false);
      window.clearTimeout(trackAdvanceTimeoutRef.current);
      trackAdvanceTimeoutRef.current = window.setTimeout(() => {
        trackIndexRef.current = (trackIndexRef.current + 1) % tracks.length;
        setTrackIndex(trackIndexRef.current);
        setIndicatorPulse((pulse) => pulse + 1);
        setIsPlaying(true);
        isPlayingRef.current = true;
        targetSpeedRef.current = isPoweredRef.current ? PLAY_SPEED : 0;
      }, 620);
    };

    const handleError = () => {
      // A missing or undecodable file: stop cleanly and tell assistive tech; Next/Previous still work.
      markStopped();
      setStatusMessage(`Couldn't load “${tracks[trackIndexRef.current].title}”. Try again or skip to another song.`);
    };

    const handlePlaying = () => markPlaying();
    const handlePause = () => {
      if (!audio.ended && isPlayingRef.current) markStopped();
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);

    volumeTickRefs.current = Array.from({ length: 4 }, () => {
      const tick = new Audio(volumeTickSrc);
      tick.preload = "auto";
      tick.volume = 0.035;
      tick.load();
      return tick;
    });

    return () => {
      cancelAnimationFrame(audioFadeRef.current);
      window.clearTimeout(trackAdvanceTimeoutRef.current);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
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
    const targetVolume = shouldPlay ? (volume / 100) * MUSIC_GAIN : 0;
    if (shouldPlay && audio.paused) startAudio();

    // Long fade-in when playback starts/resumes, short glide for volume changes, 1.2s fade-out.
    const duration = shouldPlay ? (needsFadeInRef.current ? 1600 : 220) : 1200;
    needsFadeInRef.current = false;

    fadeAudio(targetVolume, duration, () => {
      if (!shouldPlay) audio.pause();
    });
  }, [isPowered, isPlaying, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextSrc = new URL(tracks[trackIndex].src, document.baseURI).href;
    if (audio.src !== nextSrc) {
      audio.src = nextSrc;
      audio.load();
    }
    audio.currentTime = 0;
    audio.volume = 0;
    audioGainRef.current = 0;
    setStatusMessage("");

    if (isPoweredRef.current && isPlayingRef.current) {
      startAudio();
      needsFadeInRef.current = false;
      fadeAudio((volumeRef.current / 100) * MUSIC_GAIN, 900);
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
        // Reduced motion: the platter doesn't turn by itself (play state stays visible via the
        // tonearm LED and the record control's label). Direct dragging still moves it.
        const spin = reducedMotionRef.current ? 0 : 1;
        angleRef.current += (speedRef.current + dragMomentum) * dt * spin;
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
      tonearmZRef.current += (targetTonearm.z - tonearmZRef.current) * ease;
      tonearmAngleRef.current += (targetTonearm.angle - tonearmAngleRef.current) * ease;

      if (tonearmRef.current && isTurntableVisibleRef.current) {
        tonearmRef.current.style.transform = `translate3d(0px, 0px, ${tonearmZRef.current.toFixed(2)}px) rotate(${tonearmAngleRef.current.toFixed(3)}deg)`;
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

  const resetStageTilt = (deck: HTMLDivElement) => {
    deck.style.setProperty("--tilt-x", "0deg");
    deck.style.setProperty("--tilt-y", "0deg");
    deck.style.setProperty("--magnet-x", "0px");
    deck.style.setProperty("--magnet-y", "0px");
    deck.style.setProperty("--spot-x", "50%");
    deck.style.setProperty("--spot-y", "50%");
  };

  const updateStageFromPointer = () => {
    const deck = deckRef.current;
    const record = recordRef.current;
    if (!deck || !record) return;
    if (!isPoweredRef.current) {
      targetSpeedRef.current = 0;
      setTurntableHovered(false);
      resetStageTilt(deck);
      return;
    }

    // Pointer-driven 3D tilt and record speed-up are decorative motion: skipped for reduced-motion users.
    if (reducedMotionRef.current) {
      resetStageTilt(deck);
      targetSpeedRef.current = PLAY_SPEED;
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
    targetSpeedRef.current = isPoweredRef.current ? PLAY_SPEED + proximity * 150 : 0;
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
    targetSpeedRef.current = isPoweredRef.current ? PLAY_SPEED : 0;
    setTurntableHovered(false);
    if (deckRef.current) resetStageTilt(deckRef.current);
  };

  const handleRecordDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPoweredRef.current) return;
    recordPressRef.current = { x: event.clientX, y: event.clientY, t: performance.now(), moved: false };
    draggingRef.current = true;
    lastDragAngleRef.current = angleFromPointer(event);
    lastDragTimeRef.current = performance.now();
    momentumRef.current = 0;
    setIsDraggingRecord(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleRecordMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !isPoweredRef.current) return;
    const press = recordPressRef.current;
    if (press && !press.moved && Math.hypot(event.clientX - press.x, event.clientY - press.y) > TAP_SLOP) press.moved = true;
    const currentAngle = angleFromPointer(event);
    const now = performance.now();
    const delta = normalizeDelta(currentAngle - lastDragAngleRef.current);
    const dt = Math.max(now - lastDragTimeRef.current, 16);
    angleRef.current += delta;
    momentumRef.current = (delta / dt) * 1000;
    lastDragAngleRef.current = currentAngle;
    lastDragTimeRef.current = now;
  };

  const endRecordPress = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    setIsDraggingRecord(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleRecordUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const press = recordPressRef.current;
    recordPressRef.current = null;
    endRecordPress(event);
    // A quick tap (not a scratch) toggles play/pause.
    if (press && !press.moved && performance.now() - press.t < TAP_MAX_MS) {
      momentumRef.current = 0;
      togglePlayback();
    }
  };

  const handleRecordCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    recordPressRef.current = null;
    endRecordPress(event);
  };

  const handleRecordKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    togglePlayback();
  };

  const togglePower = () => {
    const next = !isPoweredRef.current;
    playUiSound(next ? "power-on" : "power-off");
    isPoweredRef.current = next;
    if (next) {
      // Established site behaviour: switching on starts the record playing.
      isPlayingRef.current = true;
      targetSpeedRef.current = PLAY_SPEED;
      setIsPlaying(true);
      startAudio();
    } else {
      tonearmResetUntilRef.current = performance.now() + 620;
      targetSpeedRef.current = 0;
      setTurntableHovered(false);
    }
    setIsPowered(next);
  };

  const togglePlayback = () => {
    if (!isPoweredRef.current) return;
    playUiSound("button");
    const next = !isPlayingRef.current;
    isPlayingRef.current = next;
    targetSpeedRef.current = next ? PLAY_SPEED : 0;
    if (next) startAudio(); // resumes from the paused position
    setIsPlaying(next);
  };

  const changeTrack = (direction: 1 | -1) => {
    if (!isPoweredRef.current) return;
    playUiSound("button");
    tonearmResetUntilRef.current = performance.now() + 520;
    window.clearTimeout(trackAdvanceTimeoutRef.current);

    const nextIndex = (trackIndexRef.current + direction + tracks.length) % tracks.length;
    const audio = audioRef.current;
    const switchTrack = () => {
      tonearmResetUntilRef.current = performance.now() + 520;
      trackIndexRef.current = nextIndex;
      setTrackIndex(nextIndex);
      setIndicatorPulse((pulse) => pulse + 1);
      setIsPlaying(true);
      isPlayingRef.current = true;
      targetSpeedRef.current = PLAY_SPEED;
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
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
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
    const target = event.target as HTMLElement;
    if (target.closest(".premium-volume")) return;
    // Let focused buttons handle Space/Enter themselves (Space on "Next" must mean Next, not Play/Pause).
    if ((event.key === " " || event.key === "Enter") && target.closest("button")) return;

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
  const currentTitle = tracks[trackIndex].title;
  const stopPointer = (event: React.PointerEvent) => event.stopPropagation();

  return (
    <div
      className={`premium-turntable ${isPlaybackActive || isDraggingRecord ? "is-playing" : ""} ${isPowered ? "is-powered" : "is-off"} ${isDraggingRecord ? "is-scrubbing" : ""} ${isDraggingVolume ? "is-volume-dragging" : ""}`}
      onPointerMove={handleStageMove}
      onPointerLeave={handleStageLeave}
      onKeyDown={handleTurntableKeyDown}
      ref={deckRef}
      tabIndex={0}
      role="region"
      aria-roledescription="music player"
      aria-label={`TBC vinyl turntable. ${isPowered ? (isPlaybackActive ? `Playing ${currentTitle}` : `Ready: ${currentTitle}`) : "Powered off"}. Tap the record or press Space to play or pause; arrow keys change song and volume.`}
      style={{
        "--volume-fill": `${volume}%`,
        "--volume-y": `${100 - volume}%`,
      } as React.CSSProperties}
    >
      <div className="premium-turntable-glow" aria-hidden="true" />
      <div className="premium-turntable-body">
        <div className="premium-power-control">
          <div className="premium-power-arc" aria-hidden="true" />
          <span className="is-off-label" aria-hidden="true">OFF</span>
          <button
            className="premium-knob premium-power-knob"
            type="button"
            onPointerDown={stopPointer}
            onClick={togglePower}
            role="switch"
            aria-checked={isPowered}
            aria-label="Power"
          >
            <i />
          </button>
          <span className="is-on-label" aria-hidden="true">ON</span>
        </div>

        <div
          className="premium-record"
          onPointerDown={handleRecordDown}
          onPointerMove={handleRecordMove}
          onPointerUp={handleRecordUp}
          onPointerCancel={handleRecordCancel}
          onKeyDown={handleRecordKeyDown}
          ref={recordRef}
          role="button"
          tabIndex={isPowered ? 0 : -1}
          aria-disabled={!isPowered}
          aria-pressed={isPlaybackActive}
          aria-label={isPlaybackActive ? `Pause music (${currentTitle})` : `Play music (${currentTitle})`}
          title={isPowered ? (isPlaybackActive ? "Tap the record to pause" : "Tap the record to play") : undefined}
        >
          <div className="premium-record-grooves" />
          <div className="premium-record-reflection" />
          <div className="premium-record-label">
            <div className="premium-tbc-logo">
              <img src={logoSrc} alt="" draggable="false" />
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
          aria-label="Volume"
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={volume}
          aria-valuetext={`${volume}%`}
          onPointerDown={handleVolumeDown}
          onPointerMove={handleVolumeMove}
          onPointerUp={handleVolumeUp}
          onPointerCancel={handleVolumeUp}
          onWheel={handleVolumeWheel}
          onKeyDown={(event) => {
            const keys: Record<string, number | "min" | "max"> = {
              ArrowUp: 5, ArrowRight: 5, PageUp: 10, ArrowDown: -5, ArrowLeft: -5, PageDown: -10, Home: "min", End: "max",
            };
            const action = keys[event.key];
            if (action === undefined) return;
            event.preventDefault();
            if (action === "min") applyVolume(0, true, true);
            else if (action === "max") applyVolume(100, true, true);
            else applyVolume(Math.max(0, Math.min(100, volumeRef.current + action)), true, true);
          }}
        >
          <div className="premium-volume-scale" aria-hidden="true">
            {[100, 75, 50, 25, 0].map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
          <div className="premium-volume-ticks" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
          <div className="premium-volume-track" ref={volumeTrackRef} aria-hidden="true">
            <span className="premium-volume-fill" />
            <span className="premium-volume-thumb" />
          </div>
          <div className="premium-playlist-indicators" aria-hidden="true">
            {tracks.map((track, index) => (
              <span
                key={`${track.id}-${index === trackIndex ? indicatorPulse : 0}`}
                className={index === trackIndex ? "is-active" : ""}
              />
            ))}
          </div>
        </div>

        <div className="premium-transport" role="group" aria-label={`Song ${trackIndex + 1} of ${tracks.length}: ${currentTitle}`}>
          <button
            className="premium-ctrl"
            type="button"
            onPointerDown={stopPointer}
            onClick={() => changeTrack(-1)}
            aria-label="Previous song"
            disabled={!isPowered}
          >
            <SkipBack aria-hidden="true" fill="currentColor" strokeWidth={2.2} />
          </button>
          <button
            className="premium-ctrl"
            type="button"
            onPointerDown={stopPointer}
            onClick={() => changeTrack(1)}
            aria-label="Next song"
            disabled={!isPowered}
          >
            <SkipForward aria-hidden="true" fill="currentColor" strokeWidth={2.2} />
          </button>
        </div>

        <p className="premium-sr-only" role="status" aria-live="polite">
          {statusMessage}
        </p>
      </div>
    </div>
  );
}

export default VinylTurntable;
