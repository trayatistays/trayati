"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiMiniArrowUpRight, HiOutlineClock, HiOutlineSparkles } from "react-icons/hi2";
import type { Experience } from "@/data/testimonials-and-blogs";
import supabaseImageLoader from "@/lib/supabase-image-loader";

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getParagraphs(post: Experience) {
  const source = post.content?.trim() || post.description.trim();

  if (!source) {
    return [];
  }

  const blocks = source
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length > 1) {
    return blocks;
  }

  const sentences = source
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 2) {
    return [source];
  }

  const grouped: string[] = [];

  for (let index = 0; index < sentences.length; index += 2) {
    grouped.push(sentences.slice(index, index + 2).join(" "));
  }

  return grouped;
}

function getFeaturedPost(posts: Experience[]) {
  return posts.find((post) => post.featured) ?? posts[0] ?? null;
}

export default function BlogsPage() {
  const [blogPosts, setBlogPosts] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePost, setActivePost] = useState<Experience | null>(null);

  useEffect(() => {
    void fetch("/api/experiences", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { experiences?: Experience[] } | null) => {
        const posts = data?.experiences ?? [];
        setBlogPosts(posts);
        setActivePost((current) => current ?? getFeaturedPost(posts));
      })
      .finally(() => setIsLoading(false))
      .catch(() => undefined);
  }, []);

  const featuredPost = activePost ?? getFeaturedPost(blogPosts);
  const secondaryPosts = blogPosts.filter((post) => post.id !== featuredPost?.id);
  const visibleSecondaryPosts = secondaryPosts.slice(0, 4);
  const activeParagraphs = featuredPost ? getParagraphs(featuredPost) : [];

  const openPost = (post: Experience) => {
    setActivePost(post);
    document.getElementById("blog-reader")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(13,58,82,0.08), transparent 26%), radial-gradient(circle at 85% 20%, rgba(164,108,43,0.12), transparent 24%), linear-gradient(180deg, #f9f5ee 0%, #f5f1e9 42%, #efe7dc 100%)",
      }}
    >
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

      <div className="relative z-10 mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 rounded-[1.75rem] border p-5 shadow-[0_30px_90px_rgba(13,58,82,0.08)] sm:mb-14 sm:rounded-[2rem] sm:p-8 lg:p-10"
          style={{
            borderColor: "rgba(74,101,68,0.12)",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.68), rgba(245,241,233,0.92))",
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p
                className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] sm:mb-4 sm:px-4 sm:text-xs sm:tracking-[0.28em]"
                style={{
                  color: "var(--cta)",
                  backgroundColor: "rgba(164,108,43,0.12)",
                }}
              >
                <HiOutlineSparkles className="text-sm" />
                Trayati Journal
              </p>
              <h1 className="mb-3 font-display text-[2.3rem] font-bold leading-[0.95] tracking-[-0.05em] sm:mb-4 sm:text-5xl lg:text-6xl">
                Calm, curated stories.
              </h1>
              <p style={{ color: "var(--foreground-soft)" }} className="max-w-3xl text-sm leading-7 sm:text-lg sm:leading-8">
                Stays You’ll Remember, Stories You’ll Keep
              </p>
            </div>

            <div className="hidden max-w-xl gap-3 text-sm sm:grid sm:grid-cols-3">
              <div className="rounded-[1.5rem] border px-4 py-4" style={{ borderColor: "rgba(74,101,68,0.12)", backgroundColor: "rgba(255,255,255,0.46)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{blogPosts.length || "0"}</p>
                <p style={{ color: "var(--muted)" }}>Published stories</p>
              </div>
              <div className="rounded-[1.5rem] border px-4 py-4" style={{ borderColor: "rgba(74,101,68,0.12)", backgroundColor: "rgba(255,255,255,0.46)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
                  {featuredPost?.readTime ? `${featuredPost.readTime} min` : "Slow"}
                </p>
                <p style={{ color: "var(--muted)" }}>Featured read</p>
              </div>
              <div className="rounded-[1.5rem] border px-4 py-4" style={{ borderColor: "rgba(74,101,68,0.12)", backgroundColor: "rgba(255,255,255,0.46)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{featuredPost?.category ?? "Editorial"}</p>
                <p style={{ color: "var(--muted)" }}>Current focus</p>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <p style={{ color: "var(--muted)" }}>Loading stories...</p>
        ) : blogPosts.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No stories have been published yet.</p>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
              {featuredPost ? (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}
                  onClick={() => openPost(featuredPost)}
                  className="group overflow-hidden rounded-[1.75rem] border text-left shadow-[0_30px_90px_rgba(74,101,68,0.12)] sm:rounded-[2rem]"
                  style={{
                    borderColor: "rgba(74,101,68,0.14)",
                    background:
                      "linear-gradient(155deg, rgba(255,255,255,0.76), rgba(245,241,233,0.94))",
                  }}
                >
                  <div className="grid h-full lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative min-h-[15rem] overflow-hidden sm:min-h-[24rem]">
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                        loader={supabaseImageLoader}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,58,82,0.12),rgba(13,58,82,0.68))]" />
                      <div className="absolute inset-x-4 bottom-4 sm:inset-x-8 sm:bottom-8">
                        <span className="rounded-full px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white sm:px-4 sm:text-xs sm:tracking-[0.24em]" style={{ backgroundColor: "rgba(164,108,43,0.88)" }}>
                          {featuredPost.category}
                        </span>
                        <h2 className="mt-3 max-w-xl font-display text-2xl font-semibold leading-tight tracking-[-0.04em] text-white sm:mt-4 sm:text-4xl">
                          {featuredPost.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-5 sm:p-8">
                      <div>
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.26em]" style={{ color: "var(--muted)" }}>
                          Featured story
                        </p>
                        <p className="mt-3 text-sm leading-7 sm:mt-4 sm:text-lg sm:leading-8" style={{ color: "var(--foreground-soft)" }}>
                          {featuredPost.description}
                        </p>
                      </div>

                      <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
                        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] sm:gap-3 sm:text-xs sm:tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                          <span>{formatDate(featuredPost.date)}</span>
                          <span className="hidden sm:inline">{featuredPost.author ?? "Trayati Editorial"}</span>
                          {featuredPost.readTime ? (
                            <span className="inline-flex items-center gap-2 rounded-full px-3 py-2" style={{ backgroundColor: "rgba(13,58,82,0.08)", color: "var(--secondary)" }}>
                              <HiOutlineClock className="text-sm" />
                              {featuredPost.readTime} min read
                            </span>
                          ) : null}
                        </div>

                        <div className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] sm:text-sm sm:tracking-[0.18em]" style={{ color: "var(--cta)" }}>
                          Open story
                          <HiMiniArrowUpRight className="text-lg transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ) : null}

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="rounded-[1.75rem] border p-4 sm:rounded-[2rem] sm:p-5"
                style={{
                  borderColor: "rgba(74,101,68,0.14)",
                  background:
                    "linear-gradient(150deg, rgba(255,255,255,0.68), rgba(245,241,233,0.9))",
                  boxShadow: "0 24px 70px rgba(13,58,82,0.08)",
                }}
              >
                <div className="mb-4 flex items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "rgba(74,101,68,0.08)" }}>
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.24em]" style={{ color: "var(--gold)" }}>
                      More to read
                    </p>
                    <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                      Pick what to read next
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {visibleSecondaryPosts.map((post, idx) => (
                    <motion.button
                      key={post.id}
                      type="button"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * idx, duration: 0.45 }}
                      onClick={() => openPost(post)}
                      className="group flex w-full items-start gap-3 rounded-[1.25rem] border p-3 text-left transition hover:-translate-y-1 sm:gap-4 sm:rounded-[1.5rem]"
                      style={{
                        borderColor:
                          activePost?.id === post.id ? "rgba(164,108,43,0.35)" : "rgba(74,101,68,0.10)",
                        backgroundColor:
                          activePost?.id === post.id ? "rgba(255,248,239,0.92)" : "rgba(255,255,255,0.52)",
                      }}
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] sm:h-24 sm:w-24 sm:rounded-[1.1rem]">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          loader={supabaseImageLoader}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] sm:text-[0.65rem] sm:tracking-[0.22em]" style={{ color: "var(--muted)" }}>
                          {post.category}
                        </p>
                        <h4 className="mt-2 line-clamp-2 font-display text-lg font-semibold tracking-[-0.03em] sm:text-xl" style={{ color: "var(--primary)" }}>
                          {post.title}
                        </h4>
                        <p className="mt-2 hidden line-clamp-2 text-sm leading-6 sm:block" style={{ color: "var(--foreground-soft)" }}>
                          {post.description}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

            {featuredPost ? (
              <motion.section
                id="blog-reader"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12 }}
                className="mt-8 rounded-[1.75rem] border p-4 sm:mt-12 sm:rounded-[2rem] sm:p-8 lg:p-10"
                style={{
                  borderColor: "rgba(74,101,68,0.14)",
                  background:
                    "linear-gradient(155deg, rgba(255,255,255,0.74), rgba(245,241,233,0.96))",
                  boxShadow: "0 34px 100px rgba(74,101,68,0.1)",
                }}
              >
                <div className="grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  <article className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] sm:gap-3 sm:text-xs sm:tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                      <span>{featuredPost.category}</span>
                      <span>{formatDate(featuredPost.date)}</span>
                      <span className="hidden sm:inline">{featuredPost.author ?? "Trayati Editorial"}</span>
                    </div>

                    <h2 className="mt-4 max-w-4xl font-display text-[1.95rem] font-semibold leading-tight tracking-[-0.05em] sm:mt-5 sm:text-4xl lg:text-5xl" style={{ color: "var(--primary)" }}>
                      {featuredPost.title}
                    </h2>

                    <div className="mt-4 flex flex-wrap items-center gap-2 sm:hidden">
                      {featuredPost.readTime ? (
                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em]" style={{ backgroundColor: "rgba(13,58,82,0.08)", color: "var(--secondary)" }}>
                          <HiOutlineClock className="text-sm" />
                          {featuredPost.readTime} min read
                        </span>
                      ) : null}
                      <span className="rounded-full px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em]" style={{ backgroundColor: "rgba(74,101,68,0.08)", color: "var(--primary)" }}>
                        {featuredPost.author ?? "Trayati Editorial"}
                      </span>
                    </div>

                    <p className="mt-5 max-w-3xl text-base leading-8 sm:mt-6 sm:text-[1.18rem] sm:leading-9" style={{ color: "var(--foreground-soft)" }}>
                      {featuredPost.description}
                    </p>

                    <div className="relative mt-6 overflow-hidden rounded-[1.5rem] sm:mt-8 sm:rounded-[2rem]">
                      <div className="relative aspect-[16/9]">
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          fill
                          className="object-cover"
                          loader={supabaseImageLoader}
                        />
                      </div>
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,58,82,0.02),rgba(13,58,82,0.34))]" />
                    </div>

                    <div className="editorial-prose mt-6 sm:mt-8">
                      {activeParagraphs.map((paragraph, index) => (
                        <p key={`${featuredPost.id}-${index}`}>{paragraph}</p>
                      ))}
                    </div>
                  </article>

                  <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
                    <div className="rounded-[1.75rem] border p-5" style={{ borderColor: "rgba(74,101,68,0.12)", backgroundColor: "rgba(255,255,255,0.56)" }}>
                      <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: "var(--gold)" }}>
                        Reading details
                      </p>
                      <div className="mt-5 space-y-4 text-sm">
                        <div>
                          <p className="font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Author</p>
                          <p className="mt-1 text-base" style={{ color: "var(--primary)" }}>{featuredPost.author ?? "Trayati Editorial"}</p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Category</p>
                          <p className="mt-1 text-base" style={{ color: "var(--primary)" }}>{featuredPost.category}</p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Published</p>
                          <p className="mt-1 text-base" style={{ color: "var(--primary)" }}>{formatDate(featuredPost.date)}</p>
                        </div>
                        {featuredPost.readTime ? (
                          <div>
                            <p className="font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Reading time</p>
                            <p className="mt-1 text-base" style={{ color: "var(--primary)" }}>{featuredPost.readTime} minutes</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </aside>
                </div>
              </motion.section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
