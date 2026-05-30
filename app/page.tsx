"use client"

import { MouseGlow } from "@/components/effects"
import { CustomCursor } from "@/components/custom-cursor"
import { EditorialAtmosphere } from "@/components/editorial-atmosphere"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Services } from "@/components/services"
import { Projects } from "@/components/projects"
import { Skills } from "@/components/skills"
import { Testimonials } from "@/components/testimonials"
import { Contact, Footer } from "@/components/contact"

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
          <Testimonials />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
