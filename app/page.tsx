"use client"

import { MouseGlow } from "@/components/effects"
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

      <div className="relative z-[1]">
        <main>
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
