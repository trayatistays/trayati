"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ContactForm } from "@/components/contact-form";

export default function ConnectPage() {
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
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="rounded-[1.5rem] border p-6 backdrop-blur-xl"
                style={{
                  borderColor: "rgba(80,150,220,0.2)",
                  backgroundColor: "rgba(245,241,232,0.9)",
                }}
              >
                <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                <p style={{ color: "var(--foreground-soft)" }}>{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <ContactForm source="connect" />
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
