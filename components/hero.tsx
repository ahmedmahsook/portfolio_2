"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Instagram, Linkedin, ArrowRight, Play } from "lucide-react"
import { SectionGlow } from "@/components/editorial-atmosphere"
import { heroContentShell } from "@/lib/site-layout"

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
    <section className="section-editorial relative min-h-[100svh] w-full overflow-hidden">
      <SectionGlow variant="warm-right" />
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="absolute top-[38%] left-0 right-0 h-px animate-lens-flare bg-gradient-to-r from-transparent via-[oklch(0.58_0.175_44/0.15)] to-transparent" />
      </div>

      {/* ═══ NAVBAR ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: easeLuxury }}
        className="absolute top-0 left-0 right-0 z-50 w-full py-4 sm:py-5 bg-gradient-to-b from-background/95 via-background/70 to-transparent backdrop-blur-sm"
      >
        <div className={`${heroContentShell} flex items-center justify-between`}>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-bold tracking-[0.2em] sm:tracking-[0.25em] text-foreground">
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

          <Link href="#contact" className="btn-outline inline-flex py-2.5 px-4 sm:px-6 text-[10px] min-h-[44px] shrink-0">
            Contact
          </Link>
        </div>
      </motion.nav>

      {/* ═══ DESKTOP HERO CONTENT (ONLY VISIBLE ON LG+) ═══ */}
      <div className="hidden lg:block">
        {/* ═══ OVERSIZED LAYERED DISPLAY TYPOGRAPHY ═══ */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-[8] pt-[6vh] lg:pt-[8vh] px-0"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, delay: 0.2, ease: easeLuxury }}
            className="relative w-full text-center px-1"
          >
            <span
              className="hero-display-layer hero-display-outline block text-[clamp(3.25rem,14vw,16rem)] sm:text-[clamp(4.5rem,18vw,16rem)] max-sm:whitespace-normal sm:whitespace-nowrap"
              style={{ marginBottom: "-0.12em" }}
            >
              MOIDEEN
            </span>
            <span className="hero-display-layer hero-display-glow block text-[clamp(3.75rem,16vw,18.5rem)] sm:text-[clamp(5rem,22vw,18.5rem)] max-sm:whitespace-normal sm:whitespace-nowrap -mt-[0.08em]">
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

        {/* ═══ PORTRAIT — outer div has NO transform (transform breaks 100vw bleed) ═══ */}
        <div className="hero-portrait-root absolute inset-x-0 bottom-0 top-[2%] sm:top-[5%] z-[12] w-full pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.15, ease: easeLuxury }}
            className="h-full w-full"
          >
            <div className="hero-portrait-stage portrait-cinematic relative h-[min(76svh,780px)] sm:h-[min(88svh,900px)] lg:h-[min(92svh,940px)] w-full lg:max-w-[min(94vw,680px)] lg:mx-auto animate-hero-float">
              <div className="absolute inset-x-[-8%] bottom-0 h-[30%] bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,_oklch(0.58_0.175_44/0.06)_0%,_transparent_70%)] blur-[28px] z-0 pointer-events-none" />

              <div className="relative w-full h-full z-10">
                <Image
                  src={PORTRAIT_SRC}
                  alt="Moideen Rahil Monaco — Video Editor & Performance Marketer"
                  fill
                  priority
                  sizes="100vw"
                  className="hero-portrait-img z-10"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ FOREGROUND CONTENT ═══ */}
        <div className="hero-foreground relative z-30 min-h-[100svh] w-full flex flex-col pointer-events-none">
          <div className="hero-foreground-spacer flex-1 min-h-0 lg:min-h-0" />

          <div className={`${heroContentShell} pb-8 sm:pb-10 lg:pb-14 pt-16 sm:pt-24 lg:pt-28 pointer-events-auto`}>
            <div className="hero-foreground-grid grid w-full lg:grid-cols-[1fr_minmax(280px,1.1fr)_auto] gap-8 lg:gap-6 items-end">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, delay: 0.5, ease: easeLuxury }}
                className="hero-foreground-copy relative z-20 w-full lg:pb-8"
              >
                <div className="flex items-center gap-4 mb-5 sm:mb-6 lg:mb-8">
                  <span className="w-8 h-px bg-accent/40 shrink-0" />
                  <span className="section-eyebrow">Video Editor</span>
                </div>

                <h1 className="space-y-0 w-full">
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
                    className="block text-[clamp(2.75rem,11vw,6rem)] font-bold tracking-tight leading-[0.88] gradient-text-hero animate-hero-title"
                    style={{ animationDelay: "0.85s", opacity: 0 }}
                  >
                    Monaco
                  </span>
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.1 }}
                  className="text-muted-foreground/65 text-[10px] sm:text-[11px] tracking-[0.32em] sm:tracking-[0.38em] mt-5 lg:mt-6 uppercase"
                >
                  &amp; Performance Marketer
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.25 }}
                  className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mt-7 sm:mt-8 lg:mt-10 w-full"
                >
                  <Link href="#projects" className="btn-primary group justify-center sm:justify-start w-full sm:w-auto">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                    View Projects
                  </Link>
                  <Link href="#contact" className="btn-outline justify-center sm:justify-start w-full sm:w-auto">
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
                      className="text-muted-foreground/50 hover:text-accent transition-colors duration-400 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-110 transform"
                    >
                      <Icon className="w-[18px] h-[18px]" />
                    </a>
                  ))}
                  <span className="w-8 h-px bg-muted-foreground/20 ml-1" />
                </motion.div>
              </motion.div>

              <div className="hidden lg:block min-h-[120px]" aria-hidden="true" />

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
      </div>

      {/* ═══ MOBILE HERO CONTENT (ONLY VISIBLE ON VIEWPORTS < LG) ═══ */}
      <div className="block lg:hidden w-full relative z-30 pt-[104px] pb-12 flex flex-col justify-start items-center">
        <div className="w-[90%] mx-auto flex flex-col items-center">
          
          {/* Eyebrow Tag */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: easeLuxury }}
            className="flex items-center justify-center gap-3.5 mb-2.5"
          >
            <span className="w-6 h-px bg-accent/25 shrink-0" />
            <span className="text-[9.5px] tracking-[0.28em] text-accent uppercase font-semibold">
              Video Editor &amp; Marketer
            </span>
            <span className="w-6 h-px bg-accent/25 shrink-0" />
          </motion.div>

          {/* Refined Headline Scale */}
          <h1 className="text-center w-full mb-6">
            <span
              className="block text-[clamp(2.1rem,9.5vw,2.75rem)] font-light tracking-tight leading-[1.06] text-foreground animate-hero-title"
              style={{ animationDelay: "0.45s", opacity: 0 }}
            >
              Moideen Rahil
            </span>
            <span
              className="block text-[clamp(2.5rem,11.5vw,3.25rem)] font-bold tracking-tight leading-[1.06] gradient-text-hero animate-hero-title mt-1"
              style={{ animationDelay: "0.6s", opacity: 0 }}
            >
              Monaco
            </span>
          </h1>

          {/* Luxury aspect-[4/5] Framed Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.15, ease: easeLuxury }}
            className="w-full max-w-[315px] sm:max-w-[340px] aspect-[4/5] relative rounded-2xl overflow-hidden border border-foreground/5 shadow-lift bg-background/30 mb-6.5 group hover:scale-[1.01] transition-transform duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-transparent z-0 pointer-events-none" />
            
            <Image
              src={PORTRAIT_SRC}
              alt="Moideen Rahil Monaco — B&amp;W Portrait"
              fill
              priority
              sizes="(max-width: 768px) 340px, 100vw"
              className="object-cover z-10 transition-transform duration-700 hover:scale-105"
              style={{ objectPosition: "center 12%" }}
            />
            
            <div className="absolute inset-0 z-15 pointer-events-none bg-gradient-to-t from-background/35 via-transparent to-transparent" />

            {/* Editorial Glass Badge */}
            <div className="absolute bottom-3.5 left-3.5 z-20 glass-subtle px-3 py-1 rounded-full pointer-events-none">
              <span className="text-[8px] tracking-[0.2em] font-medium text-foreground/80 uppercase">
                PORTFOLIO // 2026
              </span>
            </div>
          </motion.div>

          {/* Balanced Premium Spacing & Rhythm for description, buttons, socials */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-center text-muted-foreground/80 text-[12.5px] sm:text-[13px] leading-relaxed max-w-[285px] mx-auto mb-6"
          >
            Crafting high-impact visuals that connect{" "}
            <span className="text-accent font-medium">brands</span> to real results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="flex flex-row items-center justify-center gap-3 w-full max-w-[305px] mx-auto mb-6.5"
          >
            <Link
              href="#projects"
              className="btn-primary flex-1 justify-center py-2.5 px-4 text-[9.5px] tracking-wider min-h-[44px]"
            >
              <ArrowRight className="w-3.5 h-3.5 mr-1" />
              Projects
            </Link>
            <Link
              href="#contact"
              className="btn-outline flex-1 justify-center py-2.5 px-4 text-[9.5px] tracking-wider min-h-[44px]"
            >
              Contact
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.15 }}
            className="flex items-center justify-center gap-5"
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
                className="text-muted-foreground/45 hover:text-accent transition-colors duration-300 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:scale-105 transform"
              >
                <Icon className="w-[17px] h-[17px]" />
              </a>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  )
}
