"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Experience } from "@/data/testimonials-and-blogs";

export default function BlogsPage() {
  const [blogPosts, setBlogPosts] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/experiences", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { experiences?: Experience[] } | null) => {
        setBlogPosts(data?.experiences ?? []);
      })
      .finally(() => setIsLoading(false))
      .catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "rgba(245,241,233,0.95)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] transition hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            Back
          </Link>
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="mb-4 font-display text-5xl font-bold tracking-[-0.03em] sm:text-6xl">
            Travel Stories & Guides
          </h1>
          <p style={{ color: "var(--foreground-soft)" }} className="text-lg">
            Tips, inspiration, and stories from travelers and destinations
          </p>
        </motion.div>

        {isLoading ? (
          <p style={{ color: "var(--muted)" }}>Loading stories...</p>
        ) : blogPosts.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No stories have been published yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer rounded-[1.5rem] border p-6 transition backdrop-blur-xl sm:p-8"
                style={{
                  borderColor: "rgba(74,101,68,0.2)",
                  backgroundColor: "rgba(245,241,233,0.9)",
                  boxShadow: "0 10px 40px rgba(74,101,68,0.08)",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.boxShadow =
                    "0 20px 60px rgba(74,101,68,0.15)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.boxShadow =
                    "0 10px 40px rgba(74,101,68,0.08)";
                }}
              >
                <p
                  style={{ color: "var(--muted)" }}
                  className="mb-3 text-xs font-bold uppercase tracking-[0.2em]"
                >
                  {post.date}
                </p>
                <h3 className="mb-3 font-display text-xl font-bold transition group-hover:text-[var(--cta)]">
                  {post.title}
                </h3>
                <p style={{ color: "var(--foreground-soft)" }} className="mb-4">
                  {post.description}
                </p>
                <p
                  style={{ color: "var(--cta)" }}
                  className="text-sm font-semibold uppercase tracking-[0.16em]"
                >
                  Read More
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
