import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: "rgba(95,168,168,0.4)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: "rgba(199,91,26,0.3)" }}
        />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Big 404 */}
        <p
          className="font-display font-bold select-none leading-none mb-6"
          style={{
            fontSize: "clamp(7rem, 20vw, 14rem)",
            color: "var(--primary)",
            opacity: 0.08,
          }}
        >
          404
        </p>

        <div className="-mt-20 relative z-10">
          <div
            className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] mb-6"
            style={{
              backgroundColor: "rgba(199,91,26,0.1)",
              color: "var(--cta)",
            }}
          >
            Page Not Found
          </div>

          <h1
            className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.03em] mb-4"
            style={{ color: "var(--primary)" }}
          >
            Lost in the Hills?
          </h1>

          <p className="text-lg mb-10" style={{ color: "var(--foreground-soft)" }}>
            The page you&apos;re looking for has wandered off — like a good traveller should.
            <br />
            Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--cta)",
                boxShadow: "0 12px 30px rgba(199,91,26,0.35)",
              }}
            >
              ← Back Home
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] transition hover:scale-105 active:scale-95 border"
              style={{
                borderColor: "var(--border-soft)",
                color: "var(--primary)",
                backgroundColor: "rgba(245,241,232,0.8)",
              }}
            >
              Browse Stays →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
