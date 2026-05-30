"use client"

import { useEffect, useRef } from "react"

type CursorMode = "default" | "interactive" | "project"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
}

function isCursorSupported() {
  if (typeof window === "undefined") return false
  if ("ontouchstart" in window) return false
  if (window.matchMedia("(pointer: coarse)").matches) return false
  if (!window.matchMedia("(pointer: fine)").matches) return false
  return window.innerWidth >= 768
}

function resolveMode(target: EventTarget | null): CursorMode {
  if (!(target instanceof Element)) return "default"
  if (target.closest("[data-cursor='project']")) return "project"
  if (
    target.closest(
      "a, button, .btn-primary, .btn-outline, .nav-link, [data-cursor='interactive']"
    )
  ) {
    return "interactive"
  }
  return "default"
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const hoverTargetRef = useRef<Element | null>(null)
  const lastSparkleRef = useRef(0)
  const stateRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    scale: 1,
    targetScale: 1,
    glow: 0.35,
    targetGlow: 0.35,
    mode: "default" as CursorMode,
    visible: false,
  })

  useEffect(() => {
    if (!isCursorSupported()) return

    document.documentElement.classList.add("custom-cursor-active")

    const state = stateRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    let rafId = 0

    const resizeCanvas = () => {
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const magneticPoint = (el: Element) => {
      const rect = el.getBoundingClientRect()
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    }

    const applyModeClass = (mode: CursorMode) => {
      const el = cursorRef.current
      if (!el) return
      el.classList.remove("custom-cursor--interactive", "custom-cursor--project")
      if (mode === "interactive") el.classList.add("custom-cursor--interactive")
      if (mode === "project") el.classList.add("custom-cursor--project")
    }

    const spawnSparkle = (x: number, y: number) => {
      const particles = particlesRef.current
      if (particles.length >= 20) particles.shift()

      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.55 + 0.12,
        life: 1,
        size: Math.random() * 2.2 + 1,
      })
    }

    const onMouseMove = (e: MouseEvent) => {
      const mode = resolveMode(e.target)
      state.mode = mode
      state.visible = true
      state.targetScale = mode === "project" ? 1 : mode === "interactive" ? 1 : 1
      state.targetGlow = mode === "project" ? 0.9 : mode === "interactive" ? 0.72 : 0.38
      applyModeClass(mode)

      let nextX = e.clientX
      let nextY = e.clientY

      const hoverTarget = hoverTargetRef.current
      if (hoverTarget && mode !== "default") {
        const point = magneticPoint(hoverTarget)
        const pull = mode === "project" ? 0.22 : 0.16
        nextX += (point.x - e.clientX) * pull
        nextY += (point.y - e.clientY) * pull
      }

      state.targetX = nextX
      state.targetY = nextY

      const now = performance.now()
      if (now - lastSparkleRef.current > 28) {
        lastSparkleRef.current = now
        spawnSparkle(nextX, nextY)
        if (mode !== "default") spawnSparkle(nextX - 4, nextY - 3)
      }

      if (labelRef.current) {
        labelRef.current.style.opacity = mode === "project" ? "1" : "0"
      }
    }

    const onMouseOver = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return
      hoverTargetRef.current =
        e.target.closest("[data-cursor='project']") ??
        e.target.closest("a, button, .btn-primary, .btn-outline, .nav-link") ??
        null
    }

    const onMouseLeave = () => {
      state.visible = false
    }

    const onMouseEnter = () => {
      state.visible = true
    }

    const render = () => {
      state.x += (state.targetX - state.x) * 0.14
      state.y += (state.targetY - state.y) * 0.14
      state.scale += (state.targetScale - state.scale) * 0.1
      state.glow += (state.targetGlow - state.glow) * 0.1

      const cursor = cursorRef.current
      if (cursor) {
        cursor.style.opacity = state.visible ? "1" : "0"
        cursor.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) scale(${state.scale})`
        cursor.style.setProperty("--cursor-glow", String(state.glow))
      }

      if (ctx && canvas) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

        for (const particle of particlesRef.current) {
          particle.life -= 0.022
          particle.x += particle.vx
          particle.y += particle.vy

          if (particle.life <= 0) continue

          const alpha = particle.life * 0.62
          const radius = particle.size * (0.35 + particle.life * 0.65)

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `oklch(0.62 0.16 48 / ${alpha})`
          ctx.fill()

          ctx.beginPath()
          ctx.arc(particle.x - 1, particle.y - 1, radius * 0.45, 0, Math.PI * 2)
          ctx.fillStyle = `oklch(0.78 0.11 78 / ${alpha * 0.75})`
          ctx.fill()
        }

        particlesRef.current = particlesRef.current.filter((p) => p.life > 0)
      }

      rafId = requestAnimationFrame(render)
    }

    resizeCanvas()
    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("mouseover", onMouseOver, { passive: true })
    document.addEventListener("mouseleave", onMouseLeave)
    document.addEventListener("mouseenter", onMouseEnter)
    window.addEventListener("resize", resizeCanvas)
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseover", onMouseOver)
      document.removeEventListener("mouseleave", onMouseLeave)
      document.removeEventListener("mouseenter", onMouseEnter)
      window.removeEventListener("resize", resizeCanvas)
      document.documentElement.classList.remove("custom-cursor-active")
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="custom-cursor-canvas" aria-hidden="true" />
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
        <div className="custom-cursor-ring" />
        <div className="custom-cursor-core" />
        <span ref={labelRef} className="custom-cursor-label">
          View Project
        </span>
      </div>
    </>
  )
}
