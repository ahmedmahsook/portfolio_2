"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { SectionGlow } from "@/components/editorial-atmosphere"

import { projects, Project } from "./project-data"
import { siteDivider, siteShell } from "@/lib/site-layout"

type PremiumProject = Project & {
  featured?: boolean
  featuredRank?: number
}

const premiumTemplates = [
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
]

function toVideoBaseName(filename: string) {
  return filename.replace(/\.[^/.]+$/, "")
}

function posterForVideoPath(videoPath: string) {
  const filename = videoPath.split("/").pop() ?? ""
  const base = toVideoBaseName(filename)
  const dir = videoPath.startsWith("/videos/") ? "/videos" : "/video"
  return `${dir}/thumb_opt_${base}.jpg`
}

function playbackSrc(videoPath: string) {
  const filename = videoPath.split("/").pop() ?? ""
  const base = toVideoBaseName(filename)
  const dir = videoPath.startsWith("/videos/") ? "/videos" : "/video"
  return `${dir}/opt_${base}.mp4`
}

function buildPremiumProjectsFromVideos(videoPaths: string[], startingId: number): PremiumProject[] {
  return videoPaths.map((videoPath, idx) => {
    const t = premiumTemplates[idx % premiumTemplates.length]

    return {
      id: startingId + idx,
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

function ProjectCard({
  project,
  index,
  onSelect,
}: {
  project: PremiumProject
  index: number
  onSelect: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const preferredSrc = project.featured ? playbackSrc(project.video) : project.video
  const [videoSrc, setVideoSrc] = useState(preferredSrc)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      data-cursor="project"
      className="group cursor-pointer"
    >
      <div className="project-card relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#2d1b11]">
        {/* Video layer (autoplays immediately) */}
        <video
          src={videoSrc}
          poster={project.poster}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          onError={() => {
            if (videoSrc !== project.video) setVideoSrc(project.video)
          }}
          onLoadedData={() => setIsVideoReady(true)}
          onCanPlay={() => setIsVideoReady(true)}
          className={`absolute inset-0 w-full h-full object-cover z-[1] transition-opacity duration-700 ${
            isVideoReady ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Poster Image layer (crossfades out once video is ready) */}
        <img
          src={project.poster}
          alt={project.title}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? "scale-105" : "scale-100"
          } transition-opacity duration-700 ${isVideoReady ? "opacity-0" : "opacity-100"} z-[2]`}
          loading="lazy"
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
  const preferredSrc = project.featured ? playbackSrc(project.video) : project.video
  const [videoSrc, setVideoSrc] = useState(preferredSrc)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

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
  const [allProjects, setAllProjects] = useState<PremiumProject[]>(() => projects as PremiumProject[])
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    let cancelled = false

    async function loadPremiumVideos() {
      try {
        const res = await fetch("/api/videos", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { videos?: string[] }
        const paths = Array.isArray(data.videos) ? data.videos : []

        const base = projects as PremiumProject[]
        const existingVideoSet = new Set(base.map((p) => p.video))
        const premium = buildPremiumProjectsFromVideos(
          paths.filter(
            (path) =>
              !existingVideoSet.has(path) && !existingVideoSet.has(playbackSrc(path))
          ),
          base.length + 1
        )

        // Featured projects should appear first, without renumbering existing items.
        const merged = [...base, ...premium].sort((a, b) => {
          const ar = a.featuredRank ?? Number.POSITIVE_INFINITY
          const br = b.featuredRank ?? Number.POSITIVE_INFINITY
          if (ar !== br) return ar - br
          return a.id - b.id
        })

        if (!cancelled) setAllProjects(merged)
      } catch {
        // Silent fail keeps the current projects list stable.
      }
    }

    loadPremiumVideos()
    return () => {
      cancelled = true
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

        {/* Project grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {allProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onSelect={() => setSelectedProject(project)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
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
