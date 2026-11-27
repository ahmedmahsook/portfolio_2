"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Menu, X } from "lucide-react"
import { siteShell } from "@/lib/site-layout"

const PORTRAIT_SRC = "/hero-portrait.jpg"

const navItems = [
  { name: "Home", href: "#", active: true },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Projects", href: "#projects" },
]

const easeLuxury = [0.22, 1, 0.36, 1] as const

const stagger = {
  container: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <section className="relative min-h-[100svh] w-full flex items-center justify-center pt-24 pb-8 sm:pt-28 sm:pb-12 lg:pt-24 lg:pb-8 overflow-hidden bg-background">

      {/* ═══ NAVBAR ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.05, ease: easeLuxury }}
        className="fixed top-0 left-0 right-0 z-50 w-full py-3 sm:py-5 bg-background/85 via-background/60 backdrop-blur-md border-b border-border/20"
      >
        <div className={`${siteShell} flex items-center justify-between`}>
          {/* Brand Logo */}
          <Link href="/" className="flex flex-col min-w-0 select-none group">
            <span className="text-sm sm:text-base font-bold tracking-[0.25em] text-foreground transition-colors group-hover:text-accent">
              FILMSOFMONACO
            </span>
            <span className="text-[9px] tracking-[0.35em] text-muted-foreground uppercase mt-0.5">
              Portfolio
            </span>
          </Link>

          {/* Desktop Centered Nav Links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link text-xs tracking-widest uppercase transition-colors hover:text-accent ${
                  item.active ? "text-accent font-semibold is-active" : "text-foreground/80 font-medium"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Action: Desktop Contact button & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="#contact"
              className="hidden sm:inline-flex btn-minimal-outline py-1.5 px-4 text-[11px] tracking-wider rounded-lg"
            >
              Contact
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ═══ MOBILE NAVIGATION DRAWER ═══ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: easeLuxury }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-2xl flex flex-col pt-24 px-6 pb-10 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div className="flex flex-col items-center justify-center flex-1 gap-6 text-center">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.3 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-bold tracking-tight text-foreground/85 hover:text-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="pt-4 w-full max-w-xs"
              >
                <Link
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-minimal-primary w-full justify-center py-3 text-sm"
                >
                  <span>Contact Me</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            <div className="text-center text-[11px] text-muted-foreground tracking-widest uppercase">
              © {new Date().getFullYear()} Moideen Rahil Monaco
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          DESKTOP & RESPONSIVE LAYOUT
          ═══════════════════════════════════════════ */}
      <div className="w-full relative z-10">
        <div className={`${siteShell} grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 xl:gap-12 items-center`}>
          
          {/* Left Column: Copy & CTAs (~60% width on desktop) */}
          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center order-2 lg:order-1 text-center lg:text-left select-none pt-0 lg:pt-0"
          >
            {/* Professional title / Profession */}
            <motion.p 
              variants={stagger.item} 
              className="hero-minimal-profession mb-2 sm:mb-3 text-[11px] sm:text-xs tracking-[0.2em]"
            >
              Videographer &amp; Editor
            </motion.p>

            {/* Name — guaranteed single line on desktop */}
            <motion.h1 
              variants={stagger.item} 
              className="hero-minimal-name mb-3 sm:mb-5 text-[1.65rem] xs:text-[1.85rem] sm:text-[2.4rem] lg:text-[clamp(1.85rem,3.4vw,3.25rem)] whitespace-normal lg:whitespace-nowrap"
            >
              MOIDEEN RAHIL MONACO
            </motion.h1>

            {/* Concise Value Proposition */}
            <motion.p 
              variants={stagger.item} 
              className="hero-minimal-desc max-w-xl mx-auto lg:mx-0 mb-5 sm:mb-8 text-[13px] sm:text-[15px] leading-relaxed"
            >
              Creating cinematic content and high-performing creative campaigns for brands, businesses, and creators.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={stagger.item} 
              className="flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <Link href="#projects" className="btn-minimal-primary flex-1 sm:flex-initial py-2.5 px-4 sm:py-3.5 sm:px-7 text-xs sm:text-sm">
                <span>View Projects</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <Link href="#contact" className="btn-minimal-outline flex-1 sm:flex-initial py-2.5 px-4 sm:py-3.5 sm:px-7 text-xs sm:text-sm">
                <span>Contact Me</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Clean Luxury Editorial Portrait (40% width on desktop) */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: easeLuxury }}
              className="relative w-full max-w-[280px] xs:max-w-[310px] sm:max-w-[350px] md:max-w-[380px] lg:max-w-[420px] xl:max-w-[460px] aspect-[4/5] mx-auto lg:mr-0 select-none"
            >
              {/* Elegant editorial image frame harmonized with the website */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border/40 shadow-sm bg-[var(--card)]">
                <Image
                  src={PORTRAIT_SRC}
                  alt="Moideen Rahil Monaco — Videographer & Editor"
                  fill
                  priority
                  sizes="(max-width: 640px) 310px, (max-width: 1024px) 380px, 460px"
                  className="object-cover object-[50%_15%] transition-transform duration-700 ease-out hover:scale-[1.03]"
                />
                {/* Subtle warm luxury color grading tint: blends the photograph naturally with the website cream & terracotta palette */}
                <div 
                  className="absolute inset-0 pointer-events-none mix-blend-color opacity-30 bg-[#C96A2B]"
                  aria-hidden="true"
                />
                <div 
                  className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-15 bg-[#F5EFE6]"
                  aria-hidden="true"
                />
              </div>
            </motion.div>
          </div>

        </div>
      </div>

    </section>
  )
}
