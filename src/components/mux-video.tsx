"use client";

import MuxPlayer from "@mux/mux-player-react";

interface MuxVideoProps {
  playbackId: string;
  poster?: string;
  className?: string;
}

export function MuxVideo({ playbackId, poster, className }: MuxVideoProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={poster}
      muted
      autoPlay
      loop
      playsInline
      streamType="on-demand"
      className={className}
    />
  );
}
