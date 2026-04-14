import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { featuredStays } from "../src/data/featured-stays";
import { testimonials } from "../src/data/testimonials-and-blogs";
import { experiences } from "../src/data/testimonials-and-blogs";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedStays() {
  console.log(`Seeding ${featuredStays.length} stays...`);

  for (const [index, stay] of featuredStays.entries()) {
    const row = {
      id: stay.id,
      title: stay.title,
      subtitle: stay.subtitle,
      location: stay.location,
      city: stay.city,
      state: stay.state,
      country: stay.country,
      pin: stay.pin,
      address: stay.address,
      google_maps_url: stay.googleMapsUrl ?? "",
      description: stay.description,
      rating: stay.rating,
      price_per_night: stay.pricePerNight,
      base_price: stay.basePrice,
      image: stay.image,
      alt: stay.alt,
      tag: stay.tag,
      type: stay.type,
      experience_type: stay.experienceType,
      amenities: JSON.stringify(stay.amenities ?? []),
      photos: JSON.stringify(stay.photos ?? []),
      room_types: JSON.stringify(stay.roomTypes ?? []),
      amenities_detail: JSON.stringify(stay.amenitiesDetail ?? {}),
      meal_options: JSON.stringify(stay.mealOptions ?? []),
      cancellation_policies: JSON.stringify(stay.cancellationPolicies ?? []),
      is_active: true,
      sort_order: index,
    };

    const { error } = await supabase.from("stays").upsert(row, { onConflict: "id" });
    if (error) {
      console.error(`  ❌ ${stay.id}: ${error.message}`);
    } else {
      console.log(`  ✓ ${stay.title}`);
    }
  }
}

async function seedTestimonials() {
  console.log(`\nSeeding ${testimonials.length} testimonials...`);

  for (const [index, t] of testimonials.entries()) {
    const row = {
      id: t.id,
      name: t.name,
      title: t.title,
      text: t.text,
      rating: t.rating,
      image: t.image,
      source: t.source ?? "",
      date: t.date,
      is_active: true,
      sort_order: index,
    };

    const { error } = await supabase.from("testimonials").upsert(row, { onConflict: "id" });
    if (error) {
      console.error(`  ❌ ${t.id}: ${error.message}`);
    } else {
      console.log(`  ✓ ${t.name}`);
    }
  }
}

async function seedExperiences() {
  console.log(`\nSeeding ${experiences.length} experiences...`);

  for (const [index, e] of experiences.entries()) {
    const row = {
      id: e.id,
      title: e.title,
      description: e.description,
      content: e.content ?? "",
      image: e.image,
      category: e.category,
      author: e.author ?? "",
      date: e.date,
      read_time: e.readTime ?? null,
      featured: e.featured === true,
      is_active: true,
      sort_order: index,
    };

    const { error } = await supabase.from("experiences").upsert(row, { onConflict: "id" });
    if (error) {
      console.error(`  ❌ ${e.id}: ${error.message}`);
    } else {
      console.log(`  ✓ ${e.title}`);
    }
  }
}

async function main() {
  console.log("=== Trayati Stays — Database Seed ===\n");
  await seedStays();
  await seedTestimonials();
  await seedExperiences();
  console.log("\n=== Seed complete ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
