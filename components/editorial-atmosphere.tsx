"use client"

import { motion, useScroll, useTransform } from "framer-motion"

/** Site-wide cream + burnt-orange atmospheric layer — backgrounds only */
export function EditorialAtmosphere() {
  const { scrollYProgress } = useScroll()
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100])
  const y3 = useTransform(scrollYProgress, [0, 0.5, 1], [0, -60, 40])

  return (
    <div className="editorial-atmosphere-clip fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Cream → ivory base wash */}
      <div className="absolute inset-0 editorial-base-gradient" />

      {/* Burnt-orange abstract blooms */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-[20%] -right-[15%] w-[min(90vw,720px)] h-[min(90vw,720px)] rounded-full bg-burnt-orange-glow blur-[120px] opacity-[0.35] animate-atmospheric"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[35%] -left-[20%] w-[min(85vw,640px)] h-[min(85vw,640px)] rounded-full bg-burnt-orange-glow blur-[100px] opacity-[0.22] animate-atmospheric [animation-delay:2s]"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-[5%] right-[10%] w-[min(70vw,520px)] h-[min(50vw,400px)] rounded-[40%] bg-bronze-glow blur-[90px] opacity-[0.28] animate-breathe"
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(100vw,900px)] h-[45vh] bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,_var(--glow-orange-soft)_0%,_transparent_65%)] blur-[60px] opacity-60" />

      {/* Organic soft shape — editorial campaign feel */}
      <div className="absolute top-[18%] left-[55%] w-[280px] h-[380px] rounded-[45%] bg-[oklch(0.55_0.12_42/0.06)] blur-[70px] rotate-12" />
      <div className="absolute top-[55%] left-[8%] w-[200px] h-[260px] rounded-[50%] bg-[oklch(0.62_0.08_55/0.05)] blur-[55px] -rotate-6" />
    </div>
  )
}

type SectionGlowProps = {
  variant?: "default" | "warm-right" | "warm-left" | "center"
}

/** Per-section subtle orange accent — use behind content, not on images */
export function SectionGlow({ variant = "default" }: SectionGlowProps) {
  const positions = {
    default: "top-[15%] right-[5%] w-[420px] h-[420px] opacity-[0.2]",
    "warm-right": "top-[10%] right-[-5%] w-[500px] h-[500px] opacity-[0.25]",
    "warm-left": "bottom-[10%] left-[-8%] w-[480px] h-[480px] opacity-[0.22]",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-[0.15]",
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className={`absolute rounded-full bg-burnt-orange-glow blur-[100px] ${positions[variant]}`}
      />
      <div className="absolute inset-0 editorial-section-texture opacity-40" />
    </div>
  )
}
