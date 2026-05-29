"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Instagram, Linkedin, ArrowRight, Play } from "lucide-react"
import { SectionGlow } from "@/components/editorial-atmosphere"

/** Studio portrait — public/potrait.jpeg (white background, rim-lit B&W) */
const PORTRAIT_SRC = "/potrait.jpeg"

const navItems = [
  { name: "HOME", href: "#", active: true },
  { name: "ABOUT", href: "#about" },
  { name: "SERVICES", href: "#services" },
  { name: "PROJECTS", href: "#projects" },
]

const easeLuxury = [0.22, 1, 0.36, 1] as const

export function Hero() {
  return (
    <section className="section-editorial relative min-h-[100svh] overflow-hidden">
      <SectionGlow variant="warm-right" />
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="absolute top-[38%] left-0 right-0 h-px animate-lens-flare bg-gradient-to-r from-transparent via-[oklch(0.58_0.175_44/0.15)] to-transparent" />
      </div>

      {/* ═══ OVERSIZED LAYERED DISPLAY TYPOGRAPHY ═══ */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-[8] pt-[8vh]"
        aria-hidden="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.2, ease: easeLuxury }}
          className="relative w-full text-center"
        >
          <span
            className="hero-display-layer hero-display-outline block text-[clamp(4.5rem,18vw,16rem)] whitespace-nowrap"
            style={{ marginBottom: "-0.12em" }}
          >
            MOIDEEN
          </span>
          <span className="hero-display-layer hero-display-glow block text-[clamp(5rem,22vw,18.5rem)] whitespace-nowrap -mt-[0.08em]">
            MONACO
          </span>
        </motion.div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 1.4, delay: 0.9 }}
          className="text-[clamp(0.875rem,2vw,1.125rem)] text-muted-foreground/40 mt-4 tracking-[0.25em] uppercase font-medium"
        >
          Video Editor &amp; Marketer
        </motion.span>
      </div>

      {/* ═══ CENTER-STAGE PORTRAIT — blends into atmosphere ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, delay: 0.15, ease: easeLuxury }}
        className="absolute inset-x-0 bottom-0 top-[6%] sm:top-[5%] z-[12] flex justify-center items-end pointer-events-none"
      >
        <div className="hero-portrait-stage portrait-cinematic relative h-[min(82svh,860px)] sm:h-[min(88svh,900px)] lg:h-[min(92svh,940px)] w-full max-w-[min(94vw,680px)] animate-hero-float">
          {/* Subtle depth behind subject — white BG portrait needs almost no glow */}
          <div className="absolute inset-x-[-8%] bottom-0 h-[30%] bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,_oklch(0.58_0.175_44/0.06)_0%,_transparent_70%)] blur-[28px] z-0 pointer-events-none" />

          <div className="relative w-full h-full z-10">
            <Image
              src={PORTRAIT_SRC}
              alt="Moideen Rahil Monaco — Video Editor & Performance Marketer"
              fill
              priority
              sizes="(max-width: 768px) 94vw, 680px"
              className="hero-portrait-img z-10"
            />
          </div>
        </div>
      </motion.div>

      {/* ═══ NAVBAR ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: easeLuxury }}
        className="absolute top-0 left-0 right-0 z-50 px-6 lg:px-12 py-5 bg-gradient-to-b from-background/95 via-background/70 to-transparent backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-[0.25em] text-foreground">
              FILMSOFMONACO
            </span>
            <span className="text-[9px] tracking-[0.35em] text-muted-foreground uppercase">
              Portfolio
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link ${item.active ? "is-active" : ""}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <Link href="#contact" className="btn-outline hidden sm:inline-flex py-2 px-6 text-[10px]">
            Contact
          </Link>
        </div>
      </motion.nav>

      {/* Mobile readability scrim behind lower content */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55vh] z-[18] pointer-events-none lg:hidden"
        style={{
          background:
            "linear-gradient(to top, var(--cream) 0%, oklch(0.947 0.018 82 / 0.95) 40%, oklch(0.947 0.018 82 / 0.55) 65%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ═══ FOREGROUND CONTENT — flanks the portrait ═══ */}
      <div className="relative z-30 min-h-[100svh] flex flex-col pointer-events-none">
        <div className="flex-1 min-h-[38vh] sm:min-h-[42vh] lg:min-h-0" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full pb-10 lg:pb-14 pt-28 pointer-events-auto">
          <div className="grid lg:grid-cols-[1fr_minmax(280px,1.1fr)_auto] gap-8 lg:gap-6 items-end">
            {/* Left — editorial name stack */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: easeLuxury }}
              className="relative z-20 lg:pb-8"
            >
              <div className="flex items-center gap-4 mb-6 lg:mb-8">
                <span className="w-8 h-px bg-accent/40" />
                <span className="section-eyebrow">Video Editor</span>
              </div>

              <h1 className="space-y-0">
                <span
                  className="block heading-display text-foreground animate-hero-title"
                  style={{ animationDelay: "0.55s", opacity: 0 }}
                >
                  Moideen
                </span>
                <span
                  className="block heading-display text-foreground animate-hero-title"
                  style={{ animationDelay: "0.7s", opacity: 0 }}
                >
                  Rahil
                </span>
                <span
                  className="block text-[clamp(3rem,9vw,6rem)] font-bold tracking-tight leading-[0.85] gradient-text-hero animate-hero-title"
                  style={{ animationDelay: "0.85s", opacity: 0 }}
                >
                  Monaco
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.1 }}
                className="text-muted-foreground/65 text-[10px] sm:text-[11px] tracking-[0.38em] mt-5 lg:mt-6 uppercase"
              >
                &amp; Performance Marketer
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.25 }}
                className="flex flex-wrap items-center gap-3 sm:gap-4 mt-8 lg:mt-10"
              >
                <Link href="#projects" className="btn-primary group">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  View Projects
                </Link>
                <Link href="#contact" className="btn-outline">
                  Contact Me
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.45 }}
                className="flex items-center gap-5 mt-8 lg:mt-10"
              >
                {[
                  { icon: Instagram, href: "https://www.instagram.com/filmsofmonaco" },
                  { icon: Linkedin, href: "http://linkedin.com/in/moideen-rahil-monaco-375732246" },
                ].map(({ icon: Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground/50 hover:text-accent transition-colors duration-400 p-2 hover:scale-110 transform"
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </a>
                ))}
                <span className="w-8 h-px bg-muted-foreground/20 ml-1" />
              </motion.div>
            </motion.div>

            {/* Center spacer — portrait breathes through */}
            <div className="hidden lg:block min-h-[120px]" aria-hidden="true" />

            {/* Right — tagline & showreel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 1.2, ease: easeLuxury }}
              className="hidden lg:flex flex-col items-end gap-8 pb-10 z-20"
            >
              <div className="text-right max-w-[200px]">
                <p className="text-[13px] text-muted-foreground/55 leading-relaxed font-light">
                  Crafting visuals
                  <br />
                  that connect{" "}
                  <span className="text-accent font-medium">brands</span>
                  <br />
                  to real results.
                </p>
                <div className="w-10 h-px bg-gradient-to-r from-transparent to-muted-foreground/30 mt-5 ml-auto" />
              </div>

              <div className="relative mt-4">
                <svg className="w-24 h-24 animate-spin-slow opacity-55" viewBox="0 0 100 100">
                  <defs>
                    <path
                      id="circlePath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    />
                  </defs>
                  <text className="fill-muted-foreground/45 text-[11px] tracking-[0.15em]">
                    <textPath href="#circlePath">
                      • SEE SHOWREEL • SEE SHOWREEL
                    </textPath>
                  </text>
                </svg>
                <button
                  type="button"
                  className="absolute inset-0 m-auto w-12 h-12 flex items-center justify-center rounded-full border border-border bg-background/90 shadow-[0_4px_20px_oklch(0.45_0.158_42/0.06)] hover:border-foreground/25 hover:shadow-[0_12px_32px_oklch(0.45_0.158_42/0.08)] transition-all duration-400"
                  aria-label="Play showreel"
                >
                  <Play className="w-4 h-4 text-foreground/80 ml-0.5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="relative z-30 lg:hidden text-center text-[13px] text-muted-foreground/55 max-w-xs mx-auto px-6 pb-28 -mt-4 pointer-events-none"
      >
        Crafting visuals that connect{" "}
        <span className="text-accent font-medium">brands</span> to real results.
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 right-6 lg:right-10 z-40 hidden lg:flex flex-col items-center gap-4 pointer-events-none"
      >
        <span className="text-[9px] tracking-[0.4em] text-muted-foreground/45 writing-vertical">
          SCROLL DOWN
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/25 to-transparent" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent/70" />
      </motion.div>

    </section>
  )
}
