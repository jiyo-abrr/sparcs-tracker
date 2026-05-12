"use client";

import dynamic from "next/dynamic";
import type { MovementEntry } from "@/lib/types";

const LocationMapInner = dynamic(() => import("./LocationMapInner"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-xl border bg-muted/20 animate-pulse"
      style={{ height: 280 }}
    />
  ),
});

interface Props {
  locations: MovementEntry[];
}

export default function LocationMap({ locations }: Props) {
  if (locations.length === 0) return null;
  return <LocationMapInner locations={locations} />;
}
