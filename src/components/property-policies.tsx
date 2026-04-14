"use client";

import { CancellationPolicy, MealOption } from "@/data/featured-stays";
import { motion } from "framer-motion";

interface PropertyPoliciesProps {
  cancellationPolicies: CancellationPolicy[];
  mealOptions: MealOption[];
}

export function PropertyPolicies({
  cancellationPolicies,
  mealOptions,
}: PropertyPoliciesProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="space-y-8">
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
            <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm0 20c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 9 15.5 9 14 9.67 14 10.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 9 8.5 9 7 9.67 7 10.5 7.67 12 8.5 12zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
          Cancellation Policies
        </h3>

        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cancellationPolicies.map((policy, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="rounded-lg border p-4 transition-all"
              style={{
                borderColor: "var(--border-soft)",
                backgroundColor: "rgba(245,241,233,0.9)",
              }}
            >
              <div className="mb-2 flex items-start justify-between">
                <h4 className="font-bold" style={{ color: "var(--foreground)" }}>{policy.name}</h4>
                <span
                  className="inline-block rounded-full px-3 py-1 text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {policy.refundPercentage}%
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--foreground-soft)" }}>{policy.description}</p>
              {policy.daysBeforeCheckin > 0 && (
                <span className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                  &bull; Cancellation deadline: {policy.daysBeforeCheckin} days before check-in
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

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
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
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
                borderColor: meal.available ? "rgba(74,101,68,0.3)" : "var(--border-soft)",
                backgroundColor: meal.available ? "rgba(74,101,68,0.05)" : "var(--background-soft)",
                opacity: meal.available ? 1 : 0.6,
              }}
            >
              <div className="mb-2 flex items-start justify-between">
                <h4 className="font-bold capitalize" style={{ color: "var(--foreground)" }}>
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
                <p className="mb-3 text-sm" style={{ color: "var(--foreground-soft)" }}>{meal.description}</p>
              )}
              {meal.available && meal.price && (
                <p className="text-lg font-bold" style={{ color: "var(--primary)" }}>
                  &#8377;{meal.price} per person
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
