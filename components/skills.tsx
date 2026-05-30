"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { SectionGlow } from "@/components/editorial-atmosphere"
import { siteDivider, siteShell } from "@/lib/site-layout"

const skills = [
  { name: "After Effects", level: 95, icon: "Ae" },
  { name: "Premiere Pro", level: 90, icon: "Pr" },
  { name: "Final Cut Pro", level: 85, icon: "Fc" },
  { name: "Lightroom", level: 88, icon: "Lr" },
  { name: "Canva", level: 80, icon: "Ca" },
  { name: "Higgsfield", level: 75, icon: "Hf" },
]

export function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="skills" className="section-editorial py-24 sm:py-32 relative overflow-hidden">
      <SectionGlow variant="warm-left" />
      <div className={`${siteDivider} mb-16 sm:mb-24 lg:mb-32 relative z-[1]`} />

      <div className={`${siteShell} relative z-[1]`}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-8 h-px bg-foreground/15" />
            <span className="section-eyebrow">Expertise</span>
            <span className="w-8 h-px bg-foreground/15" />
          </div>
          <h2 className="heading-section">
            Tools & <span className="gradient-text">Skills</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group p-6 rounded-2xl glass-subtle card-surface hover-lift"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-lg border border-foreground/10 bg-foreground/[0.04] flex items-center justify-center text-sm font-bold text-foreground">
                  {skill.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-wide">{skill.name}</h3>
                  <span className="text-[11px] text-muted-foreground">{skill.level}%</span>
                </div>
              </div>

              <div className="h-px bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${skill.level}%` } : {}}
                  transition={{ duration: 1, delay: 0.4 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-gradient-to-r from-[var(--earth)] via-accent to-[var(--bronze)] rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
