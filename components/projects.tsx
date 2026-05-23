"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { SectionGlow } from "@/components/editorial-atmosphere"

import { projects, Project } from "./project-data"

const categories = ["All", "Editing", "Marketing", "Motion"] as const

/* ═══════════════════════════════════════════════════════
   PROJECT CARD
   ═══════════════════════════════════════════════════════ */

function ProjectCard({
  project,
  index,
  onSelect,
}: {
  project: Project
  index: number
  onSelect: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

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
      className="group cursor-pointer"
    >
      <div className="project-card relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#2d1b11]">
        {/* Poster Image layer (always visible initially) */}
        <img
          src={project.poster}
          alt={project.title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? "scale-105" : "scale-100"
          }`}
          loading="lazy"
        />

        {/* Video layer (only mounts and plays on hover) */}
        <AnimatePresence>
          {isHovered && (
            <motion.video
              key={project.video}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              src={project.video}
              muted
              loop
              playsInline
              autoPlay
              className="absolute inset-0 w-full h-full object-cover z-[1]"
            />
          )}
        </AnimatePresence>

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
            {project.category} — {project.subtitle}
          </span>
          <h3
            className={`text-base sm:text-lg font-semibold text-white/90 mb-1.5 transition-transform duration-500 ${
              isHovered ? "translate-y-0" : "translate-y-0.5"
            }`}
          >
            {project.title}
          </h3>
          <p
            className={`text-[12px] sm:text-[13px] text-white/45 line-clamp-2 leading-relaxed transition-all duration-500 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {project.description}
          </p>

          {/* Tags */}
          <div
            className={`flex flex-wrap gap-1.5 mt-3 transition-all duration-500 ${
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
            isHovered ? "opacity-0 scale-75" : "opacity-70 scale-100"
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
  project: Project
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

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
            src={project.video}
            controls
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] tracking-[0.22em] uppercase text-white/35 font-medium">
              {project.category}
            </span>
            <span className="w-4 h-px bg-white/15" />
            <span className="text-[10px] tracking-[0.18em] uppercase text-white/25">
              {project.subtitle}
            </span>
          </div>
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
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  return (
    <section id="projects" className="section-editorial py-32 relative overflow-hidden">
      <SectionGlow variant="warm-right" />
      <div className="section-divider mb-24 lg:mb-32 mx-auto max-w-7xl px-6 relative z-[1]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-[1]">
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
          <h2 className="heading-section mb-10">
            Featured <span className="gradient-text">Projects</span>
          </h2>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`relative px-6 py-2.5 rounded-full text-[10px] tracking-[0.18em] uppercase transition-all duration-500 ${
                  activeCategory === category
                    ? "bg-foreground text-background font-semibold shadow-[0_4px_20px_oklch(0.45_0.158_42/0.15)]"
                    : "glass-subtle text-muted-foreground hover:text-foreground card-surface hover:border-accent/30"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Project grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
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
