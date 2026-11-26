"use client"

import dynamic from "next/dynamic"
import { EditorialAtmosphere } from "@/components/editorial-atmosphere"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Projects } from "@/components/projects"

// Dynamically import desktop-only pointer effects without blocking initial render/hydration
const MouseGlow = dynamic(() => import("@/components/effects").then((mod) => mod.MouseGlow), {
  ssr: false,
})
const CustomCursor = dynamic(() => import("@/components/custom-cursor").then((mod) => mod.CustomCursor), {
  ssr: false,
})

// Dynamically import below-the-fold sections
const Services = dynamic(() => import("@/components/services").then((mod) => mod.Services))
const Skills = dynamic(() => import("@/components/skills").then((mod) => mod.Skills))
const Contact = dynamic(() => import("@/components/contact").then((mod) => mod.Contact))
const Footer = dynamic(() => import("@/components/contact").then((mod) => mod.Footer))

export default function Home() {
  return (
    <>
      <EditorialAtmosphere />
      <MouseGlow />
      <CustomCursor />

      <div className="relative z-[1] w-full min-w-0">
        <main className="w-full min-w-0">
          <Hero />
          <About />
          <Projects />
          <Services />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
