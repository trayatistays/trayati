import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Stories, Destination Guides and Stay Inspiration",
  description:
    "Explore Trayati travel stories, destination guides, and premium stay inspiration across Kasar Devi, Dharamshala, Jaisalmer, Varkala, and more.",
  alternates: { canonical: "/blogs" },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
