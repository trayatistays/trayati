export const experienceTypes = [
  "Folklore Homestays",
  "Apartments & Condos",
  "Villas",
] as const;

export type ExperienceType = (typeof experienceTypes)[number];
