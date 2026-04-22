"use client";

import { MealOption } from "@/data/featured-stays";
import { motion, Variants } from "framer-motion";
import {
  HiOutlineEnvelope,
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

interface PropertyPoliciesProps {
  cancellationPolicies: unknown[];
  mealOptions: MealOption[];
}

const CANCELLATION_POLICIES = [
  {
    icon: HiOutlineEnvelope,
    title: "Cancellation via Email",
    description:
      "To cancel your reservation, you must email us at our official address. Until you hear back from us, your reservation will not be considered cancelled.",
    accent: "var(--secondary)",
    bg: "rgba(13,58,82,0.06)",
    border: "rgba(13,58,82,0.14)",
  },
  {
    icon: HiOutlineInformationCircle,
    title: "Third-Party Bookings (OTAs)",
    description:
      "If you booked via an online travel agent such as MMT, Expedia, or Agoda — any deposit paid at booking was a commission kept by their company. We do not receive deposits from external sites. For refunds, please contact the OTA directly.",
    accent: "var(--cta)",
    bg: "rgba(164,108,43,0.06)",
    border: "rgba(164,108,43,0.14)",
  },
  {
    icon: HiOutlineBanknotes,
    title: "100% Payment on Direct Booking",
    description:
      "100% of the total amount will be charged while creating a reservation from our official website.",
    accent: "var(--primary)",
    bg: "rgba(74,101,68,0.06)",
    border: "rgba(74,101,68,0.14)",
  },
  {
    icon: HiOutlineCalendarDays,
    title: "Free Cancellation — 5+ Days Before Arrival",
    description:
      "The free cancellation period is before 5 days of arrival. Full refund will be issued if cancelled within this window.",
    accent: "#2d8a4e",
    bg: "rgba(45,138,78,0.06)",
    border: "rgba(45,138,78,0.14)",
  },
  {
    icon: HiOutlineExclamationTriangle,
    title: "50% Charge — Within 3–5 Days of Arrival",
    description:
      "After 00:00 of the 5th day before arrival, 50% of the paid amount will only be refundable.",
    accent: "#c2850c",
    bg: "rgba(194,133,12,0.06)",
    border: "rgba(194,133,12,0.14)",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "100% Charge — Within 3 Days of Arrival",
    description:
      "After 00:00 of the 3rd day before arrival, 100% cancellation charges will apply. No refund will be issued.",
    accent: "#c23b3b",
    bg: "rgba(194,59,59,0.06)",
    border: "rgba(194,59,59,0.14)",
  },
];

export function PropertyPolicies({
  mealOptions,
}: PropertyPoliciesProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="space-y-10">
      {/* ── Cancellation & Refund Policy ── */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(164,108,43,0.1)" }}
          >
            <HiOutlineShieldCheck
              className="h-5 w-5"
              style={{ color: "var(--cta)" }}
            />
          </div>
          <div>
            <h3
              className="font-display text-xl font-bold sm:text-2xl"
              style={{ color: "var(--foreground)" }}
            >
              Cancellation &amp; Refunds
            </h3>
            <p
              className="text-xs font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--muted)" }}
            >
              Know before you go
            </p>
          </div>
        </div>

        <motion.div
          className="grid gap-3 sm:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {CANCELLATION_POLICIES.map((policy, idx) => {
            const Icon = policy.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-md sm:p-5"
                style={{
                  borderColor: policy.border,
                  backgroundColor: policy.bg,
                }}
              >
                {/* Decorative accent bar */}
                <div
                  className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
                  style={{ backgroundColor: policy.accent }}
                />

                <div className="flex gap-3 pl-2 sm:gap-4 sm:pl-3">
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9"
                    style={{
                      backgroundColor: `${policy.accent}18`,
                    }}
                  >
                    <Icon
                      className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem]"
                      style={{ color: policy.accent }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      className="text-sm font-bold leading-snug sm:text-[0.95rem]"
                      style={{ color: "var(--foreground)" }}
                    >
                      {policy.title}
                    </h4>
                    <p
                      className="mt-1 text-[0.8rem] leading-relaxed sm:mt-1.5 sm:text-sm sm:leading-7"
                      style={{ color: "var(--foreground-soft)" }}
                    >
                      {policy.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ── Meal Options ── */}
      {mealOptions.length > 0 && (
        <div>
          <h3
            className="mb-6 flex items-center gap-2 font-display text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--cta)" }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
            </svg>
            Meal Options
          </h3>

          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {mealOptions.map((meal, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="rounded-lg border p-4 transition-all"
                style={{
                  borderColor: meal.available
                    ? "rgba(74,101,68,0.3)"
                    : "var(--border-soft)",
                  backgroundColor: meal.available
                    ? "rgba(74,101,68,0.05)"
                    : "var(--background-soft)",
                  opacity: meal.available ? 1 : 0.6,
                }}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4
                    className="font-bold capitalize"
                    style={{ color: "var(--foreground)" }}
                  >
                    {meal.type}
                  </h4>
                  {meal.available && (
                    <span
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-bold"
                      style={{
                        color: "var(--primary)",
                        backgroundColor: "rgba(74,101,68,0.12)",
                      }}
                    >
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Available
                    </span>
                  )}
                </div>
                {meal.description && (
                  <p
                    className="mb-3 text-sm"
                    style={{ color: "var(--foreground-soft)" }}
                  >
                    {meal.description}
                  </p>
                )}
                {meal.available && meal.price && (
                  <p
                    className="text-lg font-bold"
                    style={{ color: "var(--primary)" }}
                  >
                    &#8377;{meal.price} per person
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
