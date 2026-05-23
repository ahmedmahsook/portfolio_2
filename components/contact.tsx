"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { SectionGlow } from "@/components/editorial-atmosphere"

const socials = [
  {
    name: "LinkedIn",
    href: "http://linkedin.com/in/moideen-rahil-monaco-375732246",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/filmsofmonaco",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
]

export function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="contact" className="section-editorial py-32 relative overflow-hidden">
      <SectionGlow variant="center" />
      <div className="section-divider mb-24 lg:mb-32 mx-auto max-w-4xl px-6 relative z-[1]" />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-[1]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-8 h-px bg-foreground/15" />
            <span className="section-eyebrow">Get in Touch</span>
            <span className="w-8 h-px bg-foreground/15" />
          </div>
          <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-bold tracking-tight mb-6">
            {"Let's Create"} <span className="gradient-text">Together</span>
          </h2>
          <p className="body-copy text-base mb-12 max-w-xl mx-auto">
            Ready to bring your vision to life? {"I'm"} always excited to collaborate on projects that push creative boundaries.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-8 md:p-10 mb-10 card-surface hover-lift text-left"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="section-eyebrow mb-2">Email</h3>
                <a
                  href="mailto:hello@monaco.studio"
                  className="text-foreground/80 hover:text-foreground transition-colors duration-400 text-lg"
                >
                  hello@monaco.studio
                </a>
              </div>
              <div>
                <h3 className="section-eyebrow mb-2">Location</h3>
                <p className="text-foreground/80 text-lg">Available Worldwide</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex justify-center gap-4"
          >
            {socials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground card-surface transition-all duration-400 hover:scale-105"
                aria-label={social.name}
              >
                {social.icon}
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="py-8 relative">
      <div className="section-divider mb-8 max-w-7xl mx-auto px-6" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-muted-foreground tracking-wider">
            © {new Date().getFullYear()} Moideen Rahil Monaco. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/40 hover:text-accent transition-all duration-400 hover:scale-110"
                aria-label={social.name}
              >
                <span className="[&_svg]:w-4 [&_svg]:h-4">{social.icon}</span>
              </Link>
            ))}
            <span className="w-px h-3 bg-border mx-1" />
            <p className="text-[11px] text-muted-foreground/60 tracking-wider">
              Crafted with passion &amp; precision
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
