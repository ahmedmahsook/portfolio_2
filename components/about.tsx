"use client"

import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"
import { SectionGlow } from "@/components/editorial-atmosphere"
import { siteDivider, siteShell } from "@/lib/site-layout"

const ABOUT_IMAGE = "/about.jpeg"

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="about" className="section-editorial py-24 sm:py-32 lg:py-40 relative cinematic-border-top overflow-hidden">
      <SectionGlow variant="warm-left" />
      <div className={`${siteDivider} mb-16 sm:mb-24 lg:mb-32 relative z-[1]`} />

      <span
        className="absolute top-28 right-4 sm:right-6 lg:right-12 z-[1] text-[clamp(5rem,12vw,9rem)] font-bold text-foreground/[0.02] pointer-events-none select-none"
        aria-hidden="true"
      >
        02
      </span>

      <div className={`${siteShell} relative z-[1]`}>
        <div ref={ref} className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_40%,_oklch(0.56_0.145_42/0.05)_0%,_transparent_70%)] blur-xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative aspect-[4/5] w-full max-w-none sm:max-w-lg mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-border group card-surface hover-lift">
              <Image
                src={ABOUT_IMAGE}
                alt="Moideen Rahil Monaco — Creative Director at work with camera and gimbal"
                fill
                sizes="(max-width: 1024px) 90vw, 480px"
                className="object-cover object-[50%_42%] scale-[1.02] transition-transform duration-700 group-hover:scale-[1.03]"
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    linear-gradient(to top, var(--cream) 0%, transparent 28%),
                    radial-gradient(ellipse 100% 90% at 50% 50%, transparent 60%, oklch(0.975 0.02 76 / 0.12) 100%)
                  `,
                }}
                aria-hidden="true"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="absolute -bottom-4 right-2 sm:-bottom-5 sm:-right-4 lg:-right-6 glass rounded-xl px-5 sm:px-6 py-4 sm:py-5 hover-lift"
            >
              <div className="text-3xl font-bold text-foreground">3+</div>
              <div className="text-[10px] text-muted-foreground mt-1 tracking-widest uppercase">
                Years Experience
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-px bg-foreground/20" />
              <span className="section-eyebrow">About Me</span>
            </div>
            <h2 className="heading-section mb-8">
              Transforming Ideas Into{" "}
              <span className="gradient-text">Visual Masterpieces</span>
            </h2>
            <div className="space-y-5 sm:space-y-6 body-copy max-w-none lg:max-w-xl">
              <p>
                I&apos;m a passionate video editor and performance marketer with a deep understanding of visual storytelling. My work bridges the gap between creative artistry and strategic marketing, delivering content that not only looks stunning but also drives measurable results.
              </p>
              <p>
                With expertise spanning from Adobe After Effects to advanced performance analytics, I bring a unique perspective to every project. Whether it&apos;s crafting cinematic brand films or optimizing ad campaigns for maximum ROI, I approach each challenge with creativity and precision.
              </p>
              <p className="text-foreground/85 font-medium border-l-2 border-accent/35 pl-6">
                My philosophy is simple: every frame should tell a story, and every story should move your audience to action.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-10 sm:mt-12">
              {[
                { number: "100+", label: "Projects" },
                { number: "20+", label: "Clients" },
                { number: "5M+", label: "Views" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="text-center p-3 sm:p-4 rounded-xl glass-subtle card-surface hover-lift"
                >
                  <div className="text-2xl font-bold text-foreground">{stat.number}</div>
                  <div className="text-[10px] text-muted-foreground mt-1.5 tracking-widest uppercase">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
