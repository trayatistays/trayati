import type { MetadataRoute } from "next";
import { getAllStays } from "@/lib/stays-store";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.trayatistays.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let stays: { id: string }[] = [];
  try {
    stays = await getAllStays();
  } catch {
    stays = [];
  }
  const staticRoutes = [
    { route: "", changeFrequency: "daily" as const, priority: 1 },
    { route: "/blogs", changeFrequency: "weekly" as const, priority: 0.8 },
    { route: "/booking", changeFrequency: "weekly" as const, priority: 0.8 },
    { route: "/about", changeFrequency: "weekly" as const, priority: 0.7 },
    { route: "/connect", changeFrequency: "weekly" as const, priority: 0.7 },
    { route: "/contact", changeFrequency: "weekly" as const, priority: 0.7 },
    { route: "/solutions", changeFrequency: "weekly" as const, priority: 0.7 },
  ];

  return [
    ...staticRoutes.map(({ route, changeFrequency, priority }) => ({
      url: `${siteUrl}${route || "/"}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
    ...stays.map((stay) => ({
      url: `${siteUrl}/property/${stay.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
