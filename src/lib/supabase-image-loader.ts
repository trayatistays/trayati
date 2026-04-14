"use client";

import type { ImageLoader } from "next/image";

const supabaseImageLoader: ImageLoader = ({ src }) => {
  return src;
};

export default supabaseImageLoader;
