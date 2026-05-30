"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { heroContentShell } from "@/lib/site-layout"

const PORTRAIT_SRC = "/potrait.jpeg"

const navItems = [
  { name: "HOME", href: "#", active: true },
  { name: "ABOUT", href: "#about" },
  { name: "SERVICES", href: "#services" },
  { name: "PROJECTS", href: "#projects" },
]

const easeLuxury = [0.22, 1, 0.36, 1] as const

const stagger = {
  container: {
    staggerChildren: 0.1,
    delayChildren: 0.15,
  },
  item: {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeLuxury },
    },
  },
}

export function Hero() {
  return (
    <section className="hero-minimal-bg relative min-h-[100svh] w-full flex items-center justify-center pt-24 pb-16 lg:py-0">
      {/* ═══ Subtle Background Glowing Accents ═══ */}
      <div className="hero-minimal-glow-1" />
      <div className="hero-minimal-glow-2" />

      {/* ═══ NAVBAR ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.05, ease: easeLuxury }}
        className="absolute top-0 left-0 right-0 z-50 w-full py-4 sm:py-5 bg-gradient-to-b from-background/90 via-background/60 to-transparent backdrop-blur-sm"
      >
        <div className={`${heroContentShell} flex items-center justify-between`}>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-bold tracking-[0.25em] text-foreground">
              FILMSOFMONACO
            </span>
            <span className="text-[9px] tracking-[0.35em] text-muted-foreground uppercase mt-0.5">
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

          <Link href="#contact" className="btn-minimal-outline py-1.5 px-4 text-[11px] tracking-wider rounded-lg">
            Contact
          </Link>
        </div>
      </motion.nav>

      {/* ═══════════════════════════════════════════
          DESKTOP & RESPONSIVE LAYOUT
          ═══════════════════════════════════════════ */}
      <div className="w-full relative z-10">
        <div className={`${heroContentShell} grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center`}>
          
          {/* Left Column: Copy & CTAs */}
          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1 text-center lg:text-left select-none pt-4 lg:pt-0"
          >
            {/* Professional title / Profession */}
            <motion.p 
              variants={stagger.item} 
              className="hero-minimal-profession mb-3"
            >
              Video Editor &amp; Performance Marketer
            </motion.p>

            {/* Name */}
            <motion.h1 
              variants={stagger.item} 
              className="hero-minimal-name mb-5"
            >
              MOIDEEN RAHIL MONACO
            </motion.h1>

            {/* Concise Value Proposition */}
            <motion.p 
              variants={stagger.item} 
              className="hero-minimal-desc max-w-xl mx-auto lg:mx-0 mb-8"
            >
              Creating cinematic content and high-performing creative campaigns for brands, businesses, and creators.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={stagger.item} 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="#projects" className="btn-minimal-primary w-full sm:w-auto">
                <span>View Projects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#contact" className="btn-minimal-outline w-full sm:w-auto">
                <span>Contact Me</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Large Clean Portrait */}
          <div className="lg:col-span-5 flex items-center justify-center order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: easeLuxury }}
              className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] lg:max-w-full aspect-[4/5] animate-float-minimal"
            >
              <div className="hero-portrait-frame">
                <div className="hero-portrait-frame-inner">
                  <Image
                    src={PORTRAIT_SRC}
                    alt="Moideen Rahil Monaco Portrait"
                    fill
                    priority
                    sizes="(max-width: 1024px) 360px, 480px"
                    className="hero-portrait-image-clean"
                    style={{ objectPosition: "center 12%" }}
                  />
                  {/* Subtle grading overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

    </section>
  )
}
