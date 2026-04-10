"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HiHomeModern, HiBuildingOffice2, HiBuildingLibrary, HiArrowRight } from "react-icons/hi2";
import { RiDoubleQuotesL } from "react-icons/ri";

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
      color: "var(--primary)",
      bg: "rgba(30,109,191,0.08)",
    },
    {
      id: "villas",
      title: "Villas",
      description: "Private luxury escapes. Gated compounds, pools, sprawling lawns—your own palace with staff on call. Heritage havelis turned boutique estates or modern villas.",
      icon: HiBuildingLibrary,
      color: "var(--aqua, #35C0C4)",
      bg: "rgba(53,192,196,0.08)",
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
            <span className="w-2 h-2 rounded-full bg-cta animate-pulse" />
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
      <section className="py-20 bg-primary/5 border-y" style={{ borderColor: "var(--border-soft)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden group shadow-2xl"
          >
            {/* Using a placeholder for brand image style */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-cta/10 transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
              <RiDoubleQuotesL className="absolute top-10 left-10 text-6xl opacity-10" style={{ color: "var(--primary)" }} />
              <p className="text-2xl sm:text-3xl font-display font-medium leading-normal italic" style={{ color: "var(--primary)" }}>
                &ldquo;Modern travellers crave authenticity over cookie-cutter hotels, yet finding verified stays scattered across OTAs feels impossible.&rdquo;
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

      {/* Stay Categories */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">Stay Categories</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--foreground-soft)" }}>
              Carefully defined to match every type of traveler while preserving the essence of the destination.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group p-8 sm:p-10 rounded-[2rem] border transition-all duration-500 hover:shadow-2xl relative overflow-hidden"
                style={{ 
                  backgroundColor: "rgba(245,241,232,0.4)",
                  borderColor: "var(--border-soft)"
                }}
              >
                {/* Subtle background icon */}
                <cat.icon className="absolute -right-8 -bottom-8 text-9xl opacity-5 transition-transform group-hover:scale-110 group-hover:-rotate-12" style={{ color: cat.color }} />
                
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-3xl"
                  style={{ backgroundColor: cat.bg, color: cat.color }}
                >
                  <cat.icon />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{cat.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: "var(--foreground-soft)" }}>
                  {cat.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
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
            style={{ backgroundColor: "var(--primary)", boxShadow: "0 40px 100px rgba(30,109,191,0.25)" }}
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
                className="inline-flex items-center gap-4 bg-white px-10 py-5 rounded-full text-sm font-bold uppercase tracking-[0.2em] transition hover:bg-white/90 hover:scale-105 active:scale-95 text-primary"
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
