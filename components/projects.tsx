"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { SectionGlow } from "@/components/editorial-atmosphere"

import { Project } from "./project-data"
import { siteDivider, siteShell } from "@/lib/site-layout"
import { videos, CLOUDINARY_CLOUD_NAME } from "@/lib/videos"

type PremiumProject = Project & {
  featured?: boolean
  featuredRank?: number
}

/* ═══════════════════════════════════════════════════════
   TEMPLATES — enough for 14+ videos (cycles if more added)
   ═══════════════════════════════════════════════════════ */

const allTemplates = [
  {
    title: "Midnight Motion",
    subtitle: "A Study in Movement",
    category: "Editing" as const,
    description:
      "Cinematic exploration of movement and shadow — crafted through meticulous editorial pacing and dramatic color grading.",
    tags: ["Premiere Pro", "Color Grading", "Cinematic"],
  },
  {
    title: "Frame Theory",
    subtitle: "Visual Storytelling",
    category: "Motion" as const,
    description:
      "Dynamic motion graphics sequence blending typography, form, and rhythm into a compelling visual narrative.",
    tags: ["After Effects", "Motion Design", "Typography"],
  },
  {
    title: "Visual Pulse",
    subtitle: "Commercial Campaign",
    category: "Marketing" as const,
    description:
      "High-energy commercial piece engineered for maximum engagement — driving brand awareness through visual impact.",
    tags: ["Paid Social", "Brand Strategy", "Conversion"],
  },
  {
    title: "Motion Narrative",
    subtitle: "Editorial Short",
    category: "Editing" as const,
    description:
      "Intimate editorial short capturing raw emotion through deliberate pacing and atmospheric sound design.",
    tags: ["Documentary", "Sound Design", "Storytelling"],
  },
  {
    title: "Cinematic Flow",
    subtitle: "Brand Film",
    category: "Motion" as const,
    description:
      "Fluid brand film merging sleek transitions with bold compositions — a visual identity brought to life.",
    tags: ["Direction", "3D Animation", "Branding"],
  },
  {
    title: "Golden Hour",
    subtitle: "Performance Ad",
    category: "Marketing" as const,
    description:
      "Performance-driven ad campaign bathed in warm tones, optimized for scroll-stopping impact across platforms.",
    tags: ["Ad Creative", "A/B Testing", "ROI Driven"],
  },
  {
    title: "Silent Frames",
    subtitle: "Art Direction",
    category: "Editing" as const,
    description:
      "Contemplative art piece exploring stillness within motion — every frame composed with editorial precision.",
    tags: ["Art Direction", "Post-Production", "Grading"],
  },
  {
    title: "Royal Caribbean",
    subtitle: "Premium Editorial Cut",
    category: "Editing" as const,
    description:
      "A premium-grade editorial sequence focused on pacing, tension, and controlled highlights — built for a cinematic finish.",
    tags: ["Premium Cut", "Color Work", "Cinematic"],
  },
  {
    title: "Noir Kinetics",
    subtitle: "Motion Signature",
    category: "Motion" as const,
    description:
      "A bold motion study with refined timing, micro-transitions, and a luxury finish — designed to feel effortless and expensive.",
    tags: ["After Effects", "Micro-Transitions", "Typography"],
  },
  {
    title: "Aurum Campaign",
    subtitle: "Performance Showcase",
    category: "Marketing" as const,
    description:
      "High-intent creative engineered for scroll-stopping performance — sharp hooks, clean composition, and brand-first rhythm.",
    tags: ["Ad Creative", "Hook Design", "Conversion"],
  },
  {
    title: "Velvet Horizon",
    subtitle: "Luxury Brand Film",
    category: "Motion" as const,
    description:
      "A sweeping brand film with velvet tones, deliberate pacing, and editorial framing built for premium digital presence.",
    tags: ["Brand Film", "Direction", "Luxury"],
  },
  {
    title: "Chromatic Drift",
    subtitle: "Visual Experience",
    category: "Editing" as const,
    description:
      "An immersive chromatic journey through light, texture, and rhythm — refined in post for a high-end cinematic finish.",
    tags: ["Color Work", "Editorial", "Cinematic"],
  },
  {
    title: "Aether Drift",
    subtitle: "Ambient Synthesis",
    category: "Motion" as const,
    description:
      "A continuous flow of abstract particle dynamics and ambient lighting, crafted for high-end luxury digital displays.",
    tags: ["Particles", "Houdini", "Atmospheric"],
  },
  {
    title: "Luminous Shift",
    subtitle: "Editorial Lookbook",
    category: "Marketing" as const,
    description:
      "A visually striking lookbook campaign featuring high contrast aesthetics and bold color blocking for digital channels.",
    tags: ["Lookbook", "Direct Response", "Social Ad"],
  },
  {
    title: "Prism View",
    subtitle: "Optical Refractions",
    category: "Editing" as const,
    description:
      "A detailed exploration of light refractions, crystal optics, and chromatic aberration through dynamic macro shots.",
    tags: ["Macro", "VFX", "Color Work"],
  },
  {
    title: "Solstice Bloom",
    subtitle: "Fashion Editorial",
    category: "Marketing" as const,
    description:
      "An evocative fashion editorial merging organic silhouettes with warm, natural daylight and rhythmic pacing.",
    tags: ["High Fashion", "Pacing", "Grading"],
  },
  {
    title: "Apex Kinetic",
    subtitle: "Commercial Spot",
    category: "Motion" as const,
    description:
      "A high-octane commercial spot capturing raw velocity and precision engineering through dynamic sound design.",
    tags: ["Sound Design", "CGI", "Visual Hook"],
  },
  {
    title: "Opal Atmosphere",
    subtitle: "Documentary Short",
    category: "Editing" as const,
    description:
      "A poetic documentary portrait exploring human connection against vast landscapes with organic color science.",
    tags: ["Storytelling", "Atmosphere", "Grading"],
  },
]

/* ═══════════════════════════════════════════════════════
   VIDEO PATH HELPERS (Cloudinary Enhanced with Local Fallback)
   ═══════════════════════════════════════════════════════ */

function toVideoBaseName(pathOrId: string) {
  const clean = pathOrId
    .replace(/^portfolio\//, "")
    .replace(/^\/?video\//, "")
    .replace(/^opt_/, "")
    .replace(/^thumb_opt_/, "")
  return clean.replace(/\.[^/.]+$/, "")
}

function posterForVideoPath(videoPath: string) {
  const base = toVideoBaseName(videoPath)
  if (videoPath.startsWith("portfolio/")) {
    // High performance Cloudinary poster: auto format, auto compression, capped dimensions, first frame
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/f_auto,q_auto:eco,w_700,c_limit,so_0/portfolio/${base}.jpg`
  }
  // Local poster fallback
  return `/video/thumb_opt_${base}.jpg`
}

function previewVideoSrc(videoPath: string) {
  const base = toVideoBaseName(videoPath)
  if (videoPath.startsWith("portfolio/")) {
    // Highly optimized lightweight video preview: 540p width, eco quality, stripped audio for ultra-fast preview
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/f_auto,q_auto:eco,w_540,c_limit,ac_none/portfolio/${base}.mp4`
  }
  // Local video playback
  return `/video/opt_${base}.mp4`
}

function playbackSrc(videoPath: string) {
  const base = toVideoBaseName(videoPath)
  if (videoPath.startsWith("portfolio/")) {
    // Full quality for modal presentation
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/f_auto,q_auto/portfolio/${base}.mp4`
  }
  // Local video playback
  return `/video/opt_${base}.mp4`
}

function buildProjectsFromVideos(videoPaths: string[]): PremiumProject[] {
  // Deduplicate by base name (case-insensitive) — if both IMG_0019.MOV and
  // IMG_0019.mp4 exist, keep only one (prefer .mp4 for web playback).
  const byBase = new Map<string, string>()
  for (const vp of videoPaths) {
    const filename = vp.split("/").pop() ?? ""
    const base = toVideoBaseName(filename).toLowerCase()
    const existing = byBase.get(base)
    if (!existing) {
      byBase.set(base, vp)
    } else {
      // Prefer .mp4 over .mov/.MOV
      const existingExt = existing.split(".").pop()?.toLowerCase() ?? ""
      const currentExt = filename.split(".").pop()?.toLowerCase() ?? ""
      if (currentExt === "mp4" && existingExt !== "mp4") {
        byBase.set(base, vp)
      }
    }
  }

  const uniquePaths = Array.from(byBase.values())

  console.log(`total videos detected: ${videoPaths.length}`)
  console.log(`total projects generated: ${uniquePaths.length}`)
  console.log(`total unique projects rendered: ${uniquePaths.length}`)

  return uniquePaths.map((videoPath, idx) => {
    const t = allTemplates[idx % allTemplates.length]

    return {
      id: idx + 1,
      title: t.title,
      subtitle: t.subtitle,
      category: t.category,
      description: t.description,
      video: videoPath,
      poster: posterForVideoPath(videoPath),
      tags: t.tags,
      featured: true,
      featuredRank: idx + 1,
    }
  })
}

/* ═══════════════════════════════════════════════════════
   PROJECT CARD
   ═══════════════════════════════════════════════════════ */

// Global active preview count tracker to cap concurrent decoding on mobile/desktop
let activePreviewCount = 0
const MAX_CONCURRENT_PREVIEWS = 3

function ProjectCard({
  project,
  index,
  onSelect,
  isModalOpen,
}: {
  project: PremiumProject
  index: number
  onSelect: () => void
  isModalOpen?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const previewSrc = previewVideoSrc(project.video)
  const [videoSrc, setVideoSrc] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isVisible = useInView(cardRef, { margin: "0px 0px 100px 0px" })

  // Detect pointer capability (desktop mouse vs mobile touch)
  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches)
  }, [])

  // Desktop Hover preview management with 120ms debounce to prevent spurious requests
  useEffect(() => {
    if (!canHover) return

    if (isHovered && isVisible && !isModalOpen) {
      hoverTimerRef.current = setTimeout(() => {
        setVideoSrc(previewSrc)
        setShouldLoadVideo(true)
      }, 120)
    } else {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      setShouldLoadVideo(false)
      setIsVideoReady(false)
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.removeAttribute("src")
        videoRef.current.load()
      }
    }

    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    }
  }, [isHovered, isVisible, isModalOpen, canHover, previewSrc])

  // Explicitly trigger playback and ensure browser autoplay policy compliance
  useEffect(() => {
    if (shouldLoadVideo && videoRef.current) {
      const video = videoRef.current
      video.muted = true
      video.defaultMuted = true
      video.playsInline = true
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoReady(true)
          })
          .catch(() => {
            // Autoplay gracefully handled if user navigated away or blocked
          })
      }
    }
  }, [shouldLoadVideo, videoSrc])

  // Explicitly unload video decoder and cancel buffer when card leaves viewport or modal opens
  useEffect(() => {
    if (!isVisible || isModalOpen) {
      setShouldLoadVideo(false)
      setIsVideoReady(false)
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.removeAttribute("src")
        videoRef.current.load()
      }
    }
  }, [isVisible, isModalOpen])

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min((index % 6) * 0.04, 0.25), ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => {
        if (canHover) setIsHovered(true)
      }}
      onMouseLeave={() => {
        if (canHover) {
          setIsHovered(false)
          setShouldLoadVideo(false)
          setIsVideoReady(false)
          if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.removeAttribute("src")
            videoRef.current.load()
          }
        }
      }}
      onClick={onSelect}
      data-cursor="project"
      className="group cursor-pointer will-change-transform"
    >
      <div className="project-card relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#2d1b11]">
        {/* Video layer: Only mounted on desktop hover when in view and modal is closed */}
        {shouldLoadVideo && (
          <video
            ref={(el) => {
              videoRef.current = el
              if (el) {
                el.muted = true
                el.defaultMuted = true
              }
            }}
            src={videoSrc}
            poster={project.poster}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            onError={() => {
              const fallback = playbackSrc(project.video)
              if (videoSrc !== fallback) {
                setVideoSrc(fallback)
              }
            }}
            onLoadedData={() => setIsVideoReady(true)}
            onCanPlay={() => setIsVideoReady(true)}
            onPlaying={() => setIsVideoReady(true)}
            className={`absolute inset-0 w-full h-full object-cover z-[1] transition-opacity duration-300 ${
              isVideoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Poster Image layer: Instant sharp preview with responsive loading and zero layout shifts */}
        <img
          src={project.poster}
          alt={project.title}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement
            const fallback = posterForVideoPath(project.video)
            if (target.src !== fallback && !target.src.endsWith(fallback)) {
              target.src = fallback
            } else {
              target.src = "/placeholder.jpg"
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out ${
            isHovered ? "scale-105" : "scale-100"
          } transition-opacity duration-300 ${isVideoReady ? "opacity-0 pointer-events-none" : "opacity-100"} z-[2]`}
          loading={index < 3 ? "eager" : "lazy"}
          decoding="async"
        />

        {/* Cinematic gradient overlay */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 z-[2] ${
            isHovered ? "opacity-45" : "opacity-65"
          }`}
          style={{
            background:
              "linear-gradient(to top, oklch(0.22 0.04 42 / 0.95) 0%, oklch(0.22 0.04 42 / 0.3) 45%, transparent 100%)",
          }}
        />

        {/* Hover glow edge */}
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none z-[3] ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            boxShadow: "inset 0 0 40px oklch(0.58 0.175 44 / 0.12)",
          }}
        />

        {/* Project number watermark */}
        <div
          className={`absolute top-4 right-5 text-[3.5rem] font-bold leading-none transition-all duration-500 z-[3] ${
            isHovered
              ? "text-white/[0.1] translate-y-0"
              : "text-white/[0.05] translate-y-1"
          }`}
        >
          {String(project.id).padStart(2, "0")}
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end z-[4]">
          <span className="text-[9px] tracking-[0.22em] text-white/50 uppercase mb-1.5 font-medium">
            {project.subtitle}
          </span>
          <h3
            className={`text-base sm:text-lg font-semibold text-white/90 mb-1.5 transition-transform duration-500 ${
              isHovered ? "translate-y-0" : "translate-y-0.5"
            }`}
          >
            {project.title}
          </h3>
          <p
            className={`text-[12px] sm:text-[13px] text-white/45 line-clamp-2 leading-relaxed transition-all duration-500 max-md:opacity-100 max-md:translate-y-0 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {project.description}
          </p>

          {/* Tags */}
          <div
            className={`flex flex-wrap gap-1.5 mt-3 transition-all duration-500 max-md:opacity-100 max-md:translate-y-0 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-[9px] tracking-wider uppercase rounded-full bg-white/[0.08] text-white/50 backdrop-blur-sm border border-white/[0.06]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Play indicator */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-[3] ${
            isHovered || isVideoReady ? "opacity-0 scale-75" : "opacity-70 scale-100"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-white/[0.1] backdrop-blur-md border border-white/[0.15] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="white"
              className="ml-0.5 opacity-70"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  )
}



/* ═══════════════════════════════════════════════════════
   MODAL — Full video view
   ═══════════════════════════════════════════════════════ */

function ProjectModal({
  project,
  onClose,
}: {
  project: PremiumProject
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const preferredSrc = playbackSrc(project.video)
  const [videoSrc, setVideoSrc] = useState(preferredSrc)

  useEffect(() => {
    console.log(`[ProjectModal] Modal opened for: "${project.title}"`)
    console.log(`[ProjectModal] Selected video path: ${videoSrc}`)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose, project.title, videoSrc])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ background: "oklch(0.18 0.03 42 / 0.92)", backdropFilter: "blur(24px)" }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl rounded-2xl overflow-hidden"
        style={{
          background: "oklch(0.22 0.03 42 / 0.85)",
          backdropFilter: "blur(40px)",
          border: "1px solid oklch(0.58 0.175 44 / 0.12)",
          boxShadow: "0 40px 100px oklch(0.15 0.04 42 / 0.5), 0 0 60px oklch(0.58 0.175 44 / 0.06)",
        }}
      >
        {/* Video */}
        <div className="relative aspect-video bg-black/40">
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            autoPlay
            muted
            loop
            playsInline
            onError={() => {
              if (videoSrc !== project.video) setVideoSrc(project.video)
            }}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-[10px] tracking-[0.18em] uppercase text-white/30 mb-3">
            {project.subtitle}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-white/90 tracking-tight mb-3">
            {project.title}
          </h3>
          <p className="text-[13px] sm:text-sm text-white/40 leading-relaxed mb-5 max-w-2xl">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-[9px] tracking-wider uppercase rounded-full bg-white/[0.06] text-white/40 border border-white/[0.08]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.12] transition-all duration-300"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════ */

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<PremiumProject | null>(null)
  // Pre-seed state with curated portfolio projects for instantaneous 0ms frame-1 visual rendering
  const [allProjects, setAllProjects] = useState<PremiumProject[]>(() => buildProjectsFromVideos(videos))
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Dynamically synchronize verified published projects from Supabase in the background
  useEffect(() => {
    let isMounted = true

    fetch("/api/videos/published")
      .then((res) => {
        if (!res.ok) throw new Error("Published videos endpoint unavailable")
        return res.json()
      })
      .then((data) => {
        if (!isMounted) return

        if (!data.success || !Array.isArray(data.videos)) {
          throw new Error("Invalid response from video service")
        }

        // Map verified dynamic database records to PremiumProject format
        const dynamicProjects: PremiumProject[] = data.videos.map((v: any, idx: number) => {
          let videoRef = v.cloudinary_public_id
          if (v.source_type === "local") {
            const clean = toVideoBaseName(v.cloudinary_public_id)
            videoRef = `/video/opt_${clean}.mp4`
          }

          // Heal broken or missing poster URLs (e.g. legacy /image/upload/..._poster.jpg)
          const isPosterBroken =
            !v.poster_url ||
            v.poster_url.includes("_poster.jpg") ||
            v.poster_url.endsWith(".mp4") ||
            v.poster_url.endsWith(".mov")
          const posterUrl = isPosterBroken ? posterForVideoPath(videoRef) : v.poster_url

          return {
            id: idx + 1,
            title: v.title,
            subtitle: v.subtitle || "",
            category: v.category,
            description: v.description || "",
            video: videoRef,
            poster: posterUrl,
            tags: Array.isArray(v.tags) ? v.tags : [],
            featured: true,
            featuredRank: idx + 1,
          }
        })

        setAllProjects(dynamicProjects)
      })
      .catch((err) => {
        if (!isMounted) return
        console.warn("[projects] Error retrieving published records:", err.message)
        // Keeps the baseline curated portfolio projects without showing error or flashing
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section id="projects" className="section-editorial py-24 sm:py-32 relative overflow-hidden">
      <SectionGlow variant="warm-right" />
      <div className={`${siteDivider} mb-16 sm:mb-24 lg:mb-32 relative z-[1]`} />

      <div className={`${siteShell} relative z-[1]`}>
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-8 h-px bg-foreground/15" />
            <span className="section-eyebrow">Portfolio</span>
            <span className="w-8 h-px bg-foreground/15" />
          </div>
          <h2 className="heading-section">
            Featured <span className="gradient-text">Projects</span>
          </h2>
        </motion.div>

        {/* Project grid — dynamically responsive, renders all published projects */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#d97706] animate-spin mb-3" />
            <p className="text-white/40 text-xs tracking-widest uppercase">Loading Featured Works...</p>
          </div>
        ) : hasError ? (
          <div className="py-20 text-center">
            <p className="text-white/50 text-xs tracking-widest uppercase">Works momentarily unavailable</p>
          </div>
        ) : allProjects.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-white/40 text-xs tracking-widest uppercase">New projects coming soon</p>
          </div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            <AnimatePresence mode="popLayout">
              {allProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isModalOpen={Boolean(selectedProject)}
                  onSelect={() => setSelectedProject(project)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
