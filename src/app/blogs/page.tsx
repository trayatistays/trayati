import Image from "next/image";
import Link from "next/link";
import { HiMiniArrowUpRight, HiOutlineClock, HiOutlineSparkles } from "react-icons/hi2";
import { getAllExperiences } from "@/lib/experiences-store";
import { slugify } from "@/lib/schemas";
import supabaseImageLoader from "@/lib/supabase-image-loader";
import type { Experience } from "@/data/testimonials-and-blogs";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function experienceToSlug(post: Experience) {
  return slugify(post.title) || slugify(post.id);
}

function getFeaturedPost(posts: Experience[]) {
  return posts.find((post) => post.featured) ?? posts[0] ?? null;
}

export default async function BlogsPage() {
  const blogPosts = await getAllExperiences();

  const featuredPost = getFeaturedPost(blogPosts);
  const secondaryPosts = blogPosts.filter((post) => post.id !== featuredPost?.id);
  const visibleSecondaryPosts = secondaryPosts.slice(0, 4);

  if (blogPosts.length === 0) {
    return (
      <main
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(13,58,82,0.08), transparent 26%), radial-gradient(circle at 85% 20%, rgba(164,108,43,0.12), transparent 24%), linear-gradient(180deg, #f9f5ee 0%, #f5f1e9 42%, #efe7dc 100%)",
        }}
      >
        <div
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
        </div>
        <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <p style={{ color: "var(--muted)" }}>No stories have been published yet.</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(13,58,82,0.08), transparent 26%), radial-gradient(circle at 85% 20%, rgba(164,108,43,0.12), transparent 24%), linear-gradient(180deg, #f9f5ee 0%, #f5f1e9 42%, #efe7dc 100%)",
      }}
    >
      <div
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
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div
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
                Stays You&apos;ll Remember, Stories You&apos;ll Keep
              </p>
            </div>

            <div className="hidden max-w-xl gap-3 text-sm sm:grid sm:grid-cols-3">
              <div className="rounded-[1.5rem] border px-4 py-4" style={{ borderColor: "rgba(74,101,68,0.12)", backgroundColor: "rgba(255,255,255,0.46)" }}>
                <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{blogPosts.length}</p>
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
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          {featuredPost ? (
            <Link
              href={`/blogs/${experienceToSlug(featuredPost)}`}
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
                    fetchPriority="high"
                    sizes="(max-width: 1024px) 100vw, 45vw"
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
                      {featuredPost.description.length > 130
                        ? `${featuredPost.description.slice(0, 130).trimEnd()}…`
                        : featuredPost.description}
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
                      Read story
                      <HiMiniArrowUpRight className="text-lg transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ) : null}

          <div
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
              {visibleSecondaryPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blogs/${experienceToSlug(post)}`}
                  className="group flex w-full items-start gap-3 rounded-[1.25rem] border p-3 text-left transition hover:-translate-y-1 sm:gap-4 sm:rounded-[1.5rem]"
                  style={{
                    borderColor: "rgba(74,101,68,0.10)",
                    backgroundColor: "rgba(255,255,255,0.52)",
                  }}
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] sm:h-24 sm:w-24 sm:rounded-[1.1rem]">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      loader={supabaseImageLoader}
                      sizes="96px"
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
                      {post.description.length > 90
                        ? `${post.description.slice(0, 90).trimEnd()}…`
                        : post.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
