"use client"

import { useEffect, useRef } from "react"

export function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run on fine pointer devices (desktops/laptops with mouse, never touchscreens)
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return
    }

    const el = glowRef.current
    if (!el) return

    let rafId = 0
    let mouseX = -500
    let mouseY = -500
    let currentX = -500
    let currentY = -500

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (el.style.opacity !== "1") {
        el.style.opacity = "1"
      }
    }

    const handleMouseLeave = () => {
      if (el) el.style.opacity = "0"
    }

    const updatePosition = () => {
      currentX += (mouseX - currentX) * 0.15
      currentY += (mouseY - currentY) * 0.15
      if (el) {
        el.style.transform = `translate3d(${currentX - 200}px, ${currentY - 200}px, 0)`
      }
      rafId = requestAnimationFrame(updatePosition)
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)
    rafId = requestAnimationFrame(updatePosition)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] rounded-full z-30 opacity-0 transition-opacity duration-500 will-change-transform"
      style={{
        background: `radial-gradient(circle at center, oklch(0.56 0.145 42 / 0.045), transparent 70%)`,
      }}
      aria-hidden="true"
    />
  )
}

/** @deprecated Use EditorialAtmosphere — kept for compatibility */
export function FloatingGradients() {
  return null
}
