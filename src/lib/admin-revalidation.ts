import "server-only";

import type { ContentCollection } from "@/lib/content-store";
import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateCollectionPaths(
  collection: ContentCollection,
  id?: string,
) {
  revalidateTag(`collection-${collection}`, "max");

  switch (collection) {
    case "stays":
      revalidateTag("stays-all", "max");
      revalidateTag("stays", "max");
      if (id) {
        revalidateTag(`stay-${id}`, "max");
      }
      revalidatePath("/");
      revalidatePath("/booking");
      revalidatePath("/sitemap.xml");
      if (id) {
        revalidatePath(`/property/${id}`);
      }
      return;
    case "experiences":
      revalidatePath("/");
      revalidatePath("/blogs");
      return;
    case "testimonials":
      revalidatePath("/");
      return;
    case "reservations":
      revalidatePath("/booking");
      return;
    default:
      return;
  }
}
