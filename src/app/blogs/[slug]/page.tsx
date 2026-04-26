import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { dbGetAllExperiences } from "@/lib/db";
import { slugify } from "@/lib/schemas";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";
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

function getParagraphs(post: Experience) {
  const source = post.content?.trim() || post.description.trim();
  if (!source) return [];
  const blocks = source.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length > 1) return blocks;
  const sentences = source.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length <= 2) return [source];
  const grouped: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    grouped.push(sentences.slice(i, i + 2).join(" "));
  }
  return grouped;
}

function experienceToSlug(post: Experience) {
  return slugify(post.title) || slugify(post.id);
}

async function getExperienceBySlug(slug: string): Promise<Experience | null> {
  const experiences = await dbGetAllExperiences(true);
  return experiences.find((e) => experienceToSlug(e) === slug) ?? null;
}

export async function generateStaticParams() {
  const experiences = await dbGetAllExperiences(true);
  return experiences.map((e) => ({ slug: experienceToSlug(e) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getExperienceBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const title = post.title;
  const description = post.description;
  const url = `/blogs/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.date,
      authors: [post.author ?? "Trayati Editorial"],
      tags: [post.category],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getExperienceBySlug(slug);
  if (!post) notFound();

  const paragraphs = getParagraphs(post);
  const author = post.author ?? "Trayati Editorial";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Trayati Stays",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/trayati-logo.jpg"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blogs/${slug}`),
    },
  };

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
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] transition hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            Back to Journal
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] sm:gap-3 sm:text-xs sm:tracking-[0.24em]" style={{ color: "var(--muted)" }}>
          <span>{post.category}</span>
          <span>{formatDate(post.date)}</span>
          <span>{author}</span>
          {post.readTime ? (
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em]" style={{ backgroundColor: "rgba(13,58,82,0.08)", color: "var(--secondary)" }}>
              {post.readTime} min read
            </span>
          ) : null}
        </div>

        <h1 className="mb-4 max-w-4xl font-display text-[1.95rem] font-semibold leading-tight tracking-[-0.05em] sm:mb-5 sm:text-4xl lg:text-5xl" style={{ color: "var(--primary)" }}>
          {post.title}
        </h1>

        <p className="mb-6 max-w-3xl text-base leading-8 sm:mb-8 sm:text-[1.18rem] sm:leading-9" style={{ color: "var(--foreground-soft)" }}>
          {post.description}
        </p>

        <div className="relative mb-8 overflow-hidden rounded-[1.5rem] sm:mb-10 sm:rounded-[2rem]">
          <div className="relative aspect-[16/9]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              loader={supabaseImageLoader}
              fetchPriority="high"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,58,82,0.02),rgba(13,58,82,0.34))]" />
        </div>

        <div className="editorial-prose">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 rounded-[1.75rem] border p-5 sm:mt-14" style={{ borderColor: "rgba(74,101,68,0.12)", backgroundColor: "rgba(255,255,255,0.56)" }}>
          <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: "var(--gold)" }}>
            Reading details
          </p>
          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Author</p>
              <p className="mt-1 text-base" style={{ color: "var(--primary)" }}>{author}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Category</p>
              <p className="mt-1 text-base" style={{ color: "var(--primary)" }}>{post.category}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Published</p>
              <p className="mt-1 text-base" style={{ color: "var(--primary)" }}>{formatDate(post.date)}</p>
            </div>
            {post.readTime ? (
              <div>
                <p className="font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Reading time</p>
                <p className="mt-1 text-base" style={{ color: "var(--primary)" }}>{post.readTime} minutes</p>
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </main>
  );
}
