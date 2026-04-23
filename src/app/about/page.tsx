"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiHomeModern, HiBuildingOffice2, HiBuildingLibrary, HiArrowRight } from "react-icons/hi2";
import { RiDoubleQuotesL } from "react-icons/ri";
import { FaBehance, FaLinkedinIn } from "react-icons/fa";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  } as const;

  const categories = [
    {
      id: "folklore",
      title: "Folklore Homestays",
      description: "Local hosts, raw culture. Think family-run village homes where you eat farm-fresh meals, hear folk tales by the fire, and learn chai-making from someone who's done it 50 years.",
      icon: HiHomeModern,
      color: "var(--cta)",
      bg: "rgba(199,91,26,0.08)",
    },
    {
      id: "apartments",
      title: "Apartments & Condos",
      description: "Independent, automated, hassle-free. Smart locks, self check-in, modern comforts in heritage locations. Perfect for digital nomads or families wanting privacy.",
      icon: HiBuildingOffice2,
      color: "var(--secondary)",
      bg: "rgba(13,58,82,0.08)",
    },
    {
      id: "villas",
      title: "Villas",
      description: "Private luxury escapes. Gated compounds, pools, sprawling lawns—your own palace with staff on call. Heritage havelis turned boutique estates or modern villas.",
      icon: HiBuildingLibrary,
      color: "var(--aqua, var(--secondary))",
      bg: "rgba(13,58,82,0.08)",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden selection:bg-cta/20" style={{ backgroundColor: "var(--background)" }}>
      {/* Sticky Header */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 border-b backdrop-blur-2xl"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "rgba(245,241,232,0.85)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.3em] transition hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <HiArrowRight className="rotate-180 text-lg" />
            <span>Back to Explorer</span>
          </Link>
          <div className="flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--cta)" }} />
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em] opacity-40">About Trayati</span>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-32 sm:pb-24">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-[-0.04em] leading-[0.95] mb-10">
                Born out of <span style={{ color: "var(--primary)" }}>Passion.</span><br />
                Driven by <span style={{ color: "var(--cta)" }}>Identity.</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <p className="text-xl sm:text-2xl leading-relaxed font-medium" style={{ color: "var(--foreground)" }}>
                A bed and a room with a TV set just don’t satisfy our need to host you during your travels.
              </p>
              <p className="text-lg sm:text-xl leading-relaxed" style={{ color: "var(--foreground-soft)" }}>
                Our prima facie motive is to present you with a marketplace of trusted and selective stay options that paints the blooming characteristics of its destination through people, art, culture, and history. We take steps together in building your holiday and draw your attention more towards life this side of the world.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specialization Section */}
      <section className="py-20 border-y" style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(74,101,68,0.04)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative aspect-auto min-h-[16rem] sm:aspect-[4/3] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden group shadow-2xl"
          >
            {/* Using a placeholder for brand image style */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(74,101,68,0.2)] via-[rgba(74,101,68,0.05)] to-[rgba(164,108,43,0.1)] transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10 lg:p-12 text-center">
              <RiDoubleQuotesL className="absolute top-6 left-6 sm:top-10 sm:left-10 text-4xl sm:text-6xl opacity-10" style={{ color: "var(--primary)" }} />
              <p className="text-lg sm:text-2xl lg:text-3xl font-display font-medium leading-relaxed sm:leading-normal italic" style={{ color: "var(--primary)" }}>
                &ldquo;Modern travellers crave authenticity over cliché hotels, yet finding verified stays scattered across platform feels impossible.&rdquo;
              </p>
            </div>
          </motion.div>

          <div className="space-y-8">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.4em]" style={{ color: "var(--cta)" }}>
              The Trayati Edge
            </h2>
            <p className="text-2xl font-display font-bold leading-tight tracking-tight">
              We specialise in locally curated, authentic and heritage stays to personify your holiday with our sprinkled charm.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: "var(--foreground-soft)" }}>
              Trayati Stays bridges that gap by listing only handpicked properties. Every destination has a story, and we make sure you live inside it.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              {['Verified Stays', 'Handpicked', 'Cultural Immersion', 'Local Guidance'].map((tag) => (
                <span
                  key={tag}
                  className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border"
                  style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(255,255,255,0.5)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ backgroundColor: "var(--primary)" }} />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ backgroundColor: "var(--cta)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[0.85rem] font-bold uppercase tracking-[0.4em]" style={{ color: "var(--cta)" }}>
              Meet The Visionary
            </span>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Founder Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="lg:col-span-5 relative flex justify-center"
            >
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl group border-4" style={{ borderColor: "var(--border-soft)" }}>
                <Image
                  src="/owner.jpg"
                  alt="Ishan Saraf - Founder, Trayati Stays"
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 256px, (max-width: 1024px) 320px, 384px"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full -z-10" style={{ backgroundColor: "var(--primary)", opacity: 0.15 }} />
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full -z-10" style={{ backgroundColor: "var(--cta)", opacity: 0.1 }} />
            </motion.div>

            {/* Founder Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:col-span-7 space-y-8"
            >
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em] mb-3" style={{ color: "var(--foreground)" }}>
                  Ishan Saraf
                </h2>
                <p className="text-lg font-medium" style={{ color: "var(--primary)" }}>
                  Founder, Trayati Stays
                </p>
              </div>

              <div className="space-y-5">
                <p className="text-lg leading-relaxed" style={{ color: "var(--foreground-soft)" }}>
                  Trayati Stays is the vision of Ishan Saraf, a modern creator, entrepreneur, and experiential thinker who believes that spaces should do more than just host people; they should <span className="font-semibold" style={{ color: "var(--foreground)" }}>inspire them</span>.
                </p>
                <p className="text-lg leading-relaxed" style={{ color: "var(--foreground-soft)" }}>
                  Ishan combines a background in photography, backpacker lodging and experiences, and hands-on building to bring a unique perspective to hospitality, where <span className="font-semibold" style={{ color: "var(--foreground)" }}>aesthetics, energy, and intention merge seamlessly</span>. His journey embodies a blend of entrepreneurship and artistic expression, rooted in a deep appreciation for mindful living and meaningful experiences.
                </p>
                <p className="text-lg leading-relaxed" style={{ color: "var(--foreground-soft)" }}>
                  Ishan is also recognized for building ventures and exploring ideas across various domains, bringing a <span className="font-semibold" style={{ color: "var(--foreground)" }}>thoughtful and detail-oriented approach</span> to everything he creates.
                </p>
                <p className="text-lg leading-relaxed" style={{ color: "var(--foreground-soft)" }}>
                  At Trayati Stays, this philosophy is realized through a space that is not only luxurious but deeply integrated with its surroundings. Every texture, view, and moment is carefully curated to provide guests with a sense of <span className="font-semibold" style={{ color: "var(--cta)" }}>calm, connection, and quiet luxury</span> across India.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 pt-4">
                <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Connect:</span>
                <a
                  href="https://www.behance.net/ishansaraf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(255,255,255,0.8)", color: "var(--foreground)" }}
                  aria-label="Behance Profile"
                >
                  <FaBehance className="text-xl" />
                </a>
                <a
                  href="https://www.linkedin.com/in/ishan-saraf-4a8aa4153/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  style={{ borderColor: "var(--border-soft)", backgroundColor: "rgba(255,255,255,0.8)", color: "var(--foreground)" }}
                  aria-label="LinkedIn Profile"
                >
                  <FaLinkedinIn className="text-xl" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-[3rem] p-10 sm:p-20 text-center relative overflow-hidden"
            style={{ backgroundColor: "var(--secondary)", boxShadow: "0 40px 100px rgba(13,58,82,0.25)" }}
          >
            {/* Pattern background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-white text-[0.7rem] font-bold uppercase tracking-[0.5em] mb-8 opacity-60">Our Vision</h2>
              <p className="text-3xl sm:text-5xl font-display font-bold text-white leading-[1.1] mb-10 tracking-tight">
                Preserving living history, promoting the <span className="text-white/60">authenticity.</span>
              </p>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-12 font-medium">
                From Bir’s 100-year-old Mudhouse to Kasar Devi’s premium cottages—we aim to reach experimental travellers across all classes, craving authenticity and experience.
              </p>

              <Link
                href="/booking"
                className="inline-flex items-center gap-4 rounded-full bg-[var(--button-primary)] px-10 py-5 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:scale-105 hover:bg-[var(--button-primary-hover)] active:scale-95"
              >
                <span>Start Your Journey</span>
                <HiArrowRight className="text-lg" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Basic Footer-like link */}
      <div className="py-10 border-t text-center" style={{ borderColor: "var(--border-soft)" }}>
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] opacity-30">
          © 2026 Trayati Stays. Local Culture. Global Reach.
        </p>
      </div>
    </main>
  );
}
