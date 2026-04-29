import Link from "next/link";
import { ContactForm } from "@/components/contact-form";

export default function ConnectPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div
        className="connect-reveal sticky top-0 z-20 border-b backdrop-blur-xl"
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
        </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="connect-reveal connect-reveal--content">
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-[-0.03em] mb-4">
            Connect With Us
          </h1>
          <p style={{ color: "var(--foreground-soft)" }} className="text-lg mb-12">
            Interested in partnering with Trayati? Let&apos;s explore opportunities together.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 mb-12">
            {[
              {
                title: "Property Owners",
                description: "List your property and reach conscious travelers worldwide.",
              },
              {
                title: "Travel Agencies",
                description: "Partner with us for exclusive travel experiences.",
              },
              {
                title: "Corporate Groups",
                description: "Customized team retreats and corporate getaways.",
              },
              {
                title: "Brand Collaborations",
                description: "Connect with our audience of premium travelers.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="connect-reveal-card rounded-[1.5rem] border p-6 backdrop-blur-xl"
                style={{
                  borderColor: "rgba(74,101,68,0.2)",
                  backgroundColor: "rgba(245,241,233,0.9)",
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                <p style={{ color: "var(--foreground-soft)" }}>{item.description}</p>
              </div>
            ))}
          </div>

          <div className="connect-reveal connect-reveal--form">
            <ContactForm source="connect" />
          </div>
        </div>
      </div>
    </main>
  );
}
