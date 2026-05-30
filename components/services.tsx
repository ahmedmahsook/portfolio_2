"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { SectionGlow } from "@/components/editorial-atmosphere"
import { siteDivider, siteShell } from "@/lib/site-layout"

const services = [
  {
    title: "Video Editing",
    description: "Cinematic editing that transforms raw footage into compelling visual narratives. From color grading to sound design, every detail is crafted to perfection.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8Z"/>
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    title: "Motion Graphics",
    description: "Dynamic animations and visual effects that bring brands to life. Custom motion design for intros, lower thirds, transitions, and complete visual packages.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    title: "Performance Marketing",
    description: "Data-driven marketing strategies that maximize ROI. From paid social campaigns to conversion optimization, turning views into valuable actions.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/>
        <path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
  },
  {
    title: "Creative Direction",
    description: "Strategic creative vision that aligns visual storytelling with brand objectives. Concept development, storyboarding, and art direction for impactful campaigns.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 2.5 2.5 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20"/>
        <path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.98 3 2.5 2.5 0 0 1 1.32 4.24 2.5 2.5 0 0 1-.34 5.58 2.5 2.5 0 0 1-2.96 3.08A2.5 2.5 0 0 1 12 20"/>
      </svg>
    ),
  },
]

export function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="services" className="section-editorial py-24 sm:py-32 relative overflow-hidden">
      <SectionGlow variant="default" />
      <div className={`${siteDivider} mb-16 sm:mb-24 lg:mb-32 relative z-[1]`} />

      <div className={`${siteShell} relative z-[1]`}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-8 h-px bg-foreground/15" />
            <span className="section-eyebrow">What I Do</span>
            <span className="w-8 h-px bg-foreground/15" />
          </div>
          <h2 className="heading-section">
            Services & <span className="gradient-text">Expertise</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className="group relative p-6 sm:p-8 lg:p-10 rounded-2xl glass card-surface hover-lift overflow-hidden"
            >
              <div className="absolute inset-0 bg-[oklch(0.56_0.145_42/0.04)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl border border-foreground/10 bg-foreground/[0.03] flex items-center justify-center text-foreground mb-6 group-hover:border-foreground/25 transition-colors duration-400">
                  {service.icon}
                </div>

                <h3 className="text-lg font-semibold mb-3 tracking-tight group-hover:text-foreground transition-colors duration-400">
                  {service.title}
                </h3>

                <p className="body-copy text-[14px]">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
