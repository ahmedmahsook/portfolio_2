"use client"

import { useEffect, useState } from "react"

export function MouseGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }
    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isVisible])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        background: `radial-gradient(360px circle at ${mousePosition.x}px ${mousePosition.y}px, oklch(0.56 0.145 42 / 0.05), transparent 52%)`,
      }}
    />
  )
}

/** @deprecated Use EditorialAtmosphere — kept for compatibility */
export function FloatingGradients() {
  return null
}
