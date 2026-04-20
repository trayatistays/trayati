"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export function ContactForm() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise((r) => setTimeout(r, 1000));
    console.log("Form submitted:", form);

    setSuccess(true);
    setForm({ name: "", email: "", phone: "", message: "" });
    setLoading(false);

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="rounded-[2rem] border p-8 sm:p-10 backdrop-blur-xl max-w-2xl mx-auto"
      style={{
        borderColor: "rgba(80,150,220,0.3)",
        backgroundColor: "rgba(245,241,232,0.95)",
        boxShadow: "0 20px 60px rgba(32,60,76,0.1), inset 0 1px 0 rgba(255,255,255,0.5)",
      }}
    >
      <h2 className="font-display text-3xl font-bold mb-8 tracking-[-0.03em]">
        Get in Touch
      </h2>

      <div className="space-y-5">
        {/* Name */}
        <div className="flex flex-col">
          <label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: "var(--muted)" }}>
            Full Name
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-[1rem] px-4 py-3 text-sm outline-none transition border"
            style={{
              borderColor: "rgba(80,150,220,0.3)",
              backgroundColor: "rgba(255,255,255,0.8)",
              color: "var(--foreground)",
            }}
            placeholder="Your name"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: "var(--muted)" }}>
            Email Address
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-[1rem] px-4 py-3 text-sm outline-none transition border"
            style={{
              borderColor: "rgba(80,150,220,0.3)",
              backgroundColor: "rgba(255,255,255,0.8)",
              color: "var(--foreground)",
            }}
            placeholder="you@example.com"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: "var(--muted)" }}>
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-[1rem] px-4 py-3 text-sm outline-none transition border"
            style={{
              borderColor: "rgba(80,150,220,0.3)",
              backgroundColor: "rgba(255,255,255,0.8)",
              color: "var(--foreground)",
            }}
            placeholder="+91 98765 43210"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col">
          <label className="text-[0.65rem] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: "var(--muted)" }}>
            Message
          </label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="rounded-[1rem] px-4 py-3 text-sm outline-none transition border resize-none"
            style={{
              borderColor: "rgba(80,150,220,0.3)",
              backgroundColor: "rgba(255,255,255,0.8)",
              color: "var(--foreground)",
            }}
            placeholder="Tell us about your inquiry..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full mt-8 rounded-full py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-white transition disabled:opacity-50"
        style={{
          backgroundColor: loading ? "rgba(32,60,76,0.5)" : "var(--cta)",
          boxShadow: "0 12px 30px rgba(199,91,26,0.35)",
        }}
      >
        {loading ? "Sending..." : success ? "Message Sent! ✓" : "Send Message"}
      </motion.button>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-4 rounded-full px-4 py-2 text-center text-sm font-semibold"
          style={{
            backgroundColor: "rgba(74, 107, 68, 0.15)",
            color: "var(--forest)",
          }}
        >
          Thank you! We&apos;ll get back to you soon.
        </motion.div>
      )}
    </motion.form>
  );
}
