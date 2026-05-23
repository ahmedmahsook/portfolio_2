"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { SectionGlow } from "@/components/editorial-atmosphere"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Marketing Director, TechCorp",
    content: "Monaco transformed our brand vision into stunning visual content. The cinematic quality of his work elevated our entire marketing campaign. Absolutely exceptional!",
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Founder, Startup Labs",
    content: "Working with Monaco was a game-changer. His understanding of both creative storytelling and performance metrics is rare. Our video ads saw a 400% improvement in engagement.",
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emma Williams",
    role: "Creative Director, Fashion House",
    content: "The attention to detail and artistic vision Monaco brings to every project is unmatched. He doesn\u0027t just edit videos; he crafts visual experiences.",
    avatar: "EW",
  },
]

export function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="section-editorial py-32 relative overflow-hidden">
      <SectionGlow variant="default" />
      <div className="section-divider mb-24 lg:mb-32 mx-auto max-w-4xl px-6 relative z-[1]" />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-[1]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-8 h-px bg-foreground/15" />
            <span className="section-eyebrow">Testimonials</span>
            <span className="w-8 h-px bg-foreground/15" />
          </div>
          <h2 className="heading-section">
            Client <span className="gradient-text">Stories</span>
          </h2>
        </motion.div>

        <div className="relative min-h-[260px]">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: active === index ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className={`text-center ${active === index ? "block" : "hidden"}`}
            >
              <div className="w-16 h-16 mx-auto mb-8 rounded-full border border-foreground/15 bg-foreground/[0.04] flex items-center justify-center text-lg font-semibold text-foreground">
                {testimonial.avatar}
              </div>

              <div className="text-5xl font-bold text-foreground/[0.06] leading-none mb-4">&ldquo;</div>

              <blockquote className="text-lg md:text-xl font-medium leading-relaxed mb-8 text-foreground/90 max-w-2xl mx-auto">
                {testimonial.content}
              </blockquote>

              <div>
                <div className="font-semibold tracking-wide">{testimonial.name}</div>
                <div className="text-[12px] text-muted-foreground mt-1">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-10">
          {testimonials.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              className={`h-px rounded-full transition-all duration-500 ${
                active === index ? "bg-accent w-10" : "bg-accent/25 w-6 hover:bg-accent/45"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
