"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { experiences, type Experience } from "@/data/testimonials-and-blogs";

export default function BlogsPage() {
  const [blogPosts, setBlogPosts] = useState<Experience[]>(experiences);

  useEffect(() => {
    void fetch("/api/experiences", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { experiences?: Experience[] } | null) => {
        if (data?.experiences?.length) {
          setBlogPosts(data.experiences);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "rgba(245,241,232,0.95)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] transition hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            ← Back
          </Link>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-[-0.03em] mb-4">
            Travel Stories & Guides
          </h1>
          <p style={{ color: "var(--foreground-soft)" }} className="text-lg">
            Tips, inspiration, and stories from travelers and destinations
          </p>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group rounded-[1.5rem] border p-6 sm:p-8 cursor-pointer transition backdrop-blur-xl"
              style={{
                borderColor: "rgba(80,150,220,0.2)",
                backgroundColor: "rgba(245,241,232,0.9)",
                boxShadow: "0 10px 40px rgba(32,60,76,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(32,60,76,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(32,60,76,0.08)";
              }}
            >
              <p style={{ color: "var(--muted)" }} className="text-xs uppercase tracking-[0.2em] font-bold mb-3">
                {post.date}
              </p>
              <h3 className="font-display text-xl font-bold mb-3 group-hover:text-[var(--cta)] transition">
                {post.title}
              </h3>
              <p style={{ color: "var(--foreground-soft)" }} className="mb-4">
                {post.description}
              </p>
              <p style={{ color: "var(--cta)" }} className="text-sm font-semibold uppercase tracking-[0.16em]">
                Read More →
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
