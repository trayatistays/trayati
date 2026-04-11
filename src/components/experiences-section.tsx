"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { experiences, type Experience } from "@/data/testimonials-and-blogs";

export function ExperiencesSection() {
  const [items, setItems] = useState<Experience[]>(experiences);
  const featuredExperiences = items.filter((exp) => exp.featured);
  const otherExperiences = items.filter((exp) => !exp.featured);

  useEffect(() => {
    void fetch("/api/experiences", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { experiences?: Experience[] } | null) => {
        if (data?.experiences?.length) {
          setItems(data.experiences);
        }
      })
      .catch(() => undefined);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  } as const;

  return (
    <section className="relative overflow-hidden py-16 sm:py-24" style={{ backgroundColor: "rgba(30,109,191,0.02)" }}>
      {/* Background Pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: "url('/images/section-pattern.jpg')",
          backgroundRepeat: "repeat",
          backgroundSize: "280px",
        }}
      />

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
              backgroundColor: "rgba(199,91,26,0.1)",
              color: "var(--cta)",
            }}
          >
            Travel Stories & Insights
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.03em] mb-4">
            Explore & Learn
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--foreground-soft)" }}>
            Discover destination guides, travel tips, and inspiring stories from conscious travelers
          </p>
        </motion.div>

        {/* Featured Experiences */}
        {featuredExperiences.length > 0 && (
          <div className="mb-16">
            <h3 className="font-display text-2xl font-bold mb-8 tracking-[-0.02em]">Featured Stories</h3>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {featuredExperiences.map((experience) => (
                <motion.div
                  key={experience.id}
                  variants={itemVariants}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  className="rounded-2xl overflow-hidden backdrop-blur-xl group cursor-pointer relative"
                  style={{
                    backgroundColor: "rgba(245,241,232,0.8)",
                    border: "1px solid rgba(80,150,220,0.2)",
                    boxShadow: "0 10px 40px rgba(32,60,76,0.08)",
                  }}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-52 sm:h-64 bg-gradient-to-br from-blue-400/20 to-orange-400/20">
                    <Image
                      src={experience.image}
                      alt={experience.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Category badge */}
                    <motion.span
                      className="absolute top-4 left-4 text-xs font-bold uppercase px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: "rgba(199,91,26,0.9)",
                        color: "#fff",
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {experience.category}
                    </motion.span>

                    {/* Featured badge */}
                    <motion.span
                      className="absolute top-4 right-4 text-xs font-bold uppercase px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: "rgba(30,109,191,0.9)",
                        color: "#fff",
                      }}
                    >
                      Featured
                    </motion.span>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-8 space-y-4">
                    <h3 className="font-display text-xl font-bold leading-snug tracking-[-0.02em] group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-cta group-hover:bg-clip-text transition-all duration-300">
                      {experience.title}
                    </h3>

                    <p style={{ color: "var(--foreground-soft)" }} className="text-sm leading-relaxed line-clamp-2">
                      {experience.description}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "rgba(80,150,220,0.15)" }}>
                      <div className="flex items-center gap-4 text-xs">
                        {experience.author && (
                          <span style={{ color: "var(--muted)" }}>By {experience.author}</span>
                        )}
                        {experience.readTime && (
                          <>
                            <span style={{ color: "rgba(80,150,220,0.3)" }}>•</span>
                            <span style={{ color: "var(--muted)" }}>{experience.readTime} min read</span>
                          </>
                        )}
                      </div>
                      <motion.span
                        whileHover={{ x: 4 }}
                        style={{ color: "var(--primary)" }}
                        className="font-semibold text-sm"
                      >
                        →
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* All Experiences */}
        {otherExperiences.length > 0 && (
          <div>
            <h3 className="font-display text-2xl font-bold mb-8 tracking-[-0.02em]">More Stories</h3>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {otherExperiences.slice(0, 3).map((experience) => (
                <motion.div
                  key={experience.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="rounded-2xl overflow-hidden backdrop-blur-xl group cursor-pointer"
                  style={{
                    backgroundColor: "rgba(245,241,232,0.6)",
                    border: "1px solid rgba(80,150,220,0.15)",
                    boxShadow: "0 8px 32px rgba(32,60,76,0.06)",
                  }}
                >
                  {/* Small Image */}
                  <div className="relative overflow-hidden h-40 bg-gradient-to-br from-blue-400/10 to-orange-400/10">
                    <Image
                      src={experience.image}
                      alt={experience.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-display font-bold text-sm leading-tight">{experience.title}</h4>
                      <span
                        className="text-xs font-semibold uppercase px-2 py-1 rounded whitespace-nowrap"
                        style={{
                          backgroundColor: "rgba(199,91,26,0.1)",
                          color: "var(--cta)",
                        }}
                      >
                        {experience.category}
                      </span>
                    </div>

                    <p style={{ color: "var(--foreground-soft)" }} className="text-xs line-clamp-2">
                      {experience.description}
                    </p>

                    <div className="flex items-center gap-3 pt-3 border-t text-xs" style={{ borderColor: "rgba(80,150,220,0.1)" }}>
                      {experience.author && <span style={{ color: "var(--muted)" }}>{experience.author}</span>}
                      {experience.readTime && (
                        <>
                          <span style={{ color: "rgba(80,150,220,0.2)" }}>•</span>
                          <span style={{ color: "var(--muted)" }}>{experience.readTime} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/blogs"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-[0.2em] transition group"
            style={{
              backgroundColor: "var(--primary)",
              color: "#fff",
            }}
          >
            <span>Explore All Stories</span>
            <span className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
