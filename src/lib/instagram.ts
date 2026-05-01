import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { socialLinks } from "@/data/social-links";
import { getAllStays } from "@/lib/stays-store";

export type InstagramMediaItem = {
  id: string;
  mediaUrl: string;
  permalink: string;
  caption: string;
  alt: string;
};

type InstagramGraphResponse = {
  data?: Array<{
    id: string;
    caption?: string;
    media_type?: string;
    media_url?: string;
    permalink?: string;
    thumbnail_url?: string;
  }>;
};

export async function getInstagramFeed(limit = 8): Promise<InstagramMediaItem[]> {
  "use cache";
  cacheLife("instagram");
  cacheTag("instagram-feed", "stays");

  const customFallbacks: InstagramMediaItem[] = [
    {
      id: "insta-custom-1",
      mediaUrl: "/images/instagram/insta-1.jpg",
      permalink: socialLinks.instagram.url,
      caption: "Chasing sunsets and mountain roads. The journey is the destination at Trayati.",
      alt: "Exterior view of a Trayati stay with a motorcycle parked in front",
    },
    {
      id: "insta-custom-2",
      mediaUrl: "/images/instagram/insta-2.jpg",
      permalink: socialLinks.instagram.url,
      caption: "Finding beauty in simplicity. Traditional architecture meets mountain stillness.",
      alt: "Black and white view of a traditional mountain cabin",
    },
    {
      id: "insta-custom-3",
      mediaUrl: "/images/instagram/insta-3.jpg",
      permalink: socialLinks.instagram.url,
      caption: "The perfect corner for a quiet evening. Warm lights and mountain dreams.",
      alt: "Cozy bedside lamp and candles in a Trayati stay",
    },
  ];

  const stayFallbacks = (await getAllStays())
    .map((stay, index) => ({
      id: `fallback-${stay.id}-${index}`,
      mediaUrl: stay.image,
      permalink: socialLinks.instagram.url,
      caption: `${stay.title} at ${stay.location}`,
      alt: stay.alt,
    }));

  const fallbackInstagramItems = [...customFallbacks, ...stayFallbacks];
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return fallbackInstagramItems.slice(0, limit);
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&limit=${limit}&access_token=${accessToken}`,
      {
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      return fallbackInstagramItems.slice(0, limit);
    }

    const payload = (await response.json()) as InstagramGraphResponse;

    const items =
      payload.data
        ?.filter((item) => item.permalink && (item.media_url || item.thumbnail_url))
        .map((item) => {
          const mediaUrl = item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url;

          return mediaUrl
            ? {
                id: item.id,
                mediaUrl,
                permalink: item.permalink ?? socialLinks.instagram.url,
                caption: item.caption?.trim() || "Trayati Stays on Instagram",
                alt: item.caption?.trim() || "Trayati Stays Instagram post",
              }
            : null;
        })
        .filter((item): item is InstagramMediaItem => Boolean(item)) ?? [];

    return items.length ? items : fallbackInstagramItems.slice(0, limit);
  } catch {
    return fallbackInstagramItems.slice(0, limit);
  }
}
