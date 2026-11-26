"use client"

import { memo } from "react"

/** Site-wide cream + burnt-orange atmospheric layer — pure hardware-accelerated CSS backgrounds */
export const EditorialAtmosphere = memo(function EditorialAtmosphere() {
  return (
    <div className="editorial-atmosphere-clip fixed inset-0 overflow-hidden pointer-events-none z-0 transform-gpu" aria-hidden="true">
      {/* Cream → ivory base wash */}
      <div className="absolute inset-0 editorial-base-gradient" />

      {/* Burnt-orange abstract blooms with optimized blur & will-change */}
      <div
        className="absolute -top-[20%] -right-[15%] w-[min(90vw,720px)] h-[min(90vw,720px)] rounded-full bg-burnt-orange-glow blur-[60px] opacity-[0.28] transform-gpu will-change-transform"
      />
      <div
        className="absolute top-[35%] -left-[20%] w-[min(85vw,640px)] h-[min(85vw,640px)] rounded-full bg-burnt-orange-glow blur-[50px] opacity-[0.18] transform-gpu will-change-transform"
      />
      <div
        className="absolute bottom-[5%] right-[10%] w-[min(70vw,520px)] h-[min(50vw,400px)] rounded-[40%] bg-bronze-glow blur-[50px] opacity-[0.22] transform-gpu"
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(100vw,900px)] h-[45vh] bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,_var(--glow-orange-soft)_0%,_transparent_65%)] blur-[40px] opacity-50 transform-gpu" />

      {/* Organic soft shape — editorial campaign feel */}
      <div className="absolute top-[18%] left-[55%] w-[280px] h-[380px] rounded-[45%] bg-[oklch(0.55_0.12_42/0.05)] blur-[40px] rotate-12 transform-gpu" />
      <div className="absolute top-[55%] left-[8%] w-[200px] h-[260px] rounded-[50%] bg-[oklch(0.62_0.08_55/0.05)] blur-[35px] -rotate-6 transform-gpu" />
    </div>
  )
})

type SectionGlowProps = {
  variant?: "default" | "warm-right" | "warm-left" | "center"
}

/** Per-section subtle orange accent — use behind content, not on images */
export const SectionGlow = memo(function SectionGlow({ variant = "default" }: SectionGlowProps) {
  const positions = {
    default: "top-[15%] right-[5%] w-[420px] h-[420px] opacity-[0.18]",
    "warm-right": "top-[10%] right-[-5%] w-[500px] h-[500px] opacity-[0.22]",
    "warm-left": "bottom-[10%] left-[-8%] w-[480px] h-[480px] opacity-[0.18]",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-[0.12]",
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className={`absolute rounded-full bg-burnt-orange-glow blur-[60px] transform-gpu ${positions[variant]}`}
      />
      <div className="absolute inset-0 editorial-section-texture opacity-30" />
    </div>
  )
})
