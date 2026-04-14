"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import { ContactForm } from "@/components/contact-form";
import { socialLinks } from "@/data/social-links";

export default function ContactPage() {
  const socialIcons: Record<string, React.ComponentType<{ size?: number }>> = {
    FaWhatsapp,
    FaInstagram,
    FaFacebook,
  };

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] transition hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              &larr; Back
            </Link>
          </div>
        </motion.div>

      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none h-96">
        <div
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-25"
          style={{ backgroundColor: "rgba(13,58,82,0.3)" }}
        />
        <div
          className="absolute top-40 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: "rgba(164,108,43,0.2)" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-4">
            Get in Touch
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto" style={{ color: "var(--foreground-soft)" }}>
            Have questions about our properties? We&apos;d love to hear from you.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid sm:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              icon: "📞",
              title: "Call Us",
              content: socialLinks.phone,
              href: `tel:${socialLinks.phone}`,
            },
            {
              icon: "📧",
              title: "Email",
              content: socialLinks.email,
              href: `mailto:${socialLinks.email}`,
            },
            {
              icon: "💬",
              title: "WhatsApp",
              content: "Chat with us",
              href: socialLinks.whatsapp.url,
            },
          ].map((item, idx) => (
            <motion.a
              key={idx}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="rounded-[1.5rem] border p-8 text-center cursor-pointer transition backdrop-blur-xl"
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
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
              <p style={{ color: "var(--muted)" }} className="text-sm">
                {item.content}
              </p>
            </motion.a>
          ))}
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-16"
        >
          <ContactForm />
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <p className="font-display text-lg font-bold mb-6">Follow Us</p>
          <div className="flex justify-center gap-6">
            {[socialLinks.whatsapp, socialLinks.instagram, socialLinks.facebook].map((social) => {
              const Icon = socialIcons[social.icon];
              return (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center size-12 rounded-full border transition"
                  style={{
                    borderColor: "rgba(74,101,68,0.2)",
                    backgroundColor: "rgba(164,108,43,0.1)",
                    color: "var(--cta)",
                  }}
                >
                  <Icon size={24} />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
