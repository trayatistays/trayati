"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { testimonials } from "@/data/testimonials-and-blogs";

export function TestimonialsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  } as const;

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span
            className="inline-block text-xs font-bold uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-4"
            style={{
              backgroundColor: "rgba(30,109,191,0.1)",
              color: "var(--primary)",
            }}
          >
            Guest Stories
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.03em] mb-4">
            Experiences That Touch Hearts
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--foreground-soft)" }}>
            Discover what our guests say about their journeys with Trayati Stays
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl group overflow-hidden relative"
              style={{
                backgroundColor: "rgba(245,241,232,0.7)",
                border: "1px solid rgba(80,150,220,0.2)",
                boxShadow: "0 10px 40px rgba(32,60,76,0.08)",
              }}
            >
              {/* Decorative gradient background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(135deg, rgba(199,91,26,0.05), rgba(95,168,168,0.05))",
                  pointerEvents: "none",
                }}
              />

              <div className="relative z-10 space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="text-lg"
                      style={{
                        color: i < Math.floor(testimonial.rating) ? "var(--cta)" : "rgba(80,150,220,0.2)",
                      }}
                    >
                      ★
                    </motion.span>
                  ))}
                  <span style={{ color: "var(--muted)" }} className="text-xs font-semibold ml-2">
                    {testimonial.rating}
                  </span>
                </div>

                {/* Testimonial Text */}
                <p className="text-base leading-relaxed" style={{ color: "var(--foreground)" }}>
                  &quot;{testimonial.text}&quot;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-4 border-t" style={{ borderColor: "rgba(80,150,220,0.1)" }}>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border" style={{ borderColor: "var(--primary)" }}>
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p style={{ color: "var(--muted)" }} className="text-xs">
                      {testimonial.title}
                    </p>
                  </div>
                  {testimonial.source && (
                    <span
                      className="text-xs font-bold uppercase px-2 py-1 rounded"
                      style={{
                        backgroundColor: "var(--cta)/10",
                        color: "var(--cta)",
                      }}
                    >
                      {testimonial.source}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
