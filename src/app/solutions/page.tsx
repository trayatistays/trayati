"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function SolutionsPage() {
  const services = [
    {
      icon: "🏢",
      title: "Corporate Retreats",
      description: "Team building and corporate getaways at premium destinations.",
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Family Escapes",
      description: "Multigenerational family experiences with comfort and adventure.",
    },
    {
      icon: "💒",
      title: "Wellness Retreats",
      description: "Mind, body, and soul rejuvenation programs.",
    },
    {
      icon: "🎊",
      title: "Event Hosting",
      description: "Weddings, celebrations, and special occasions.",
    },
    {
      icon: "🤝",
      title: "Group Travel",
      description: "Coordinated experiences for groups and travel communities.",
    },
    {
      icon: "📅",
      title: "Seasonal Programs",
      description: "Curated experiences aligned with seasons and festivals.",
    },
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 border-b backdrop-blur-xl"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor: "rgba(245,241,233,0.95)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] transition hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              &larr; Back
            </Link>
          </div>
        </motion.div>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none h-96">
        <div
          className="absolute top-0 right-1/3 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: "rgba(164,108,43,0.2)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-[-0.03em] mb-4">
            Solutions & Services
          </h1>
          <p style={{ color: "var(--foreground-soft)" }} className="text-lg">
            Customized experiences for every type of travel
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="rounded-[1.5rem] border p-8 backdrop-blur-xl transition"
              style={{
                borderColor: "rgba(74,101,68,0.2)",
                backgroundColor: "rgba(245,241,233,0.9)",
                boxShadow: "0 10px 40px rgba(74,101,68,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(74,101,68,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(74,101,68,0.08)";
              }}
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="font-display text-xl font-bold mb-3">{service.title}</h3>
              <p style={{ color: "var(--foreground-soft)" }}>{service.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="font-display text-lg font-bold mb-6">Ready to plan your experience?</p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-[var(--button-primary)] px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[var(--button-primary-hover)]"
            style={{
              boxShadow: "0 12px 30px rgba(74,101,68,0.35)",
            }}
          >
            Get in Touch
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
