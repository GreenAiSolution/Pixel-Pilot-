import type { Metadata } from "next";
import { BrandFilm, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Brand Film — Pixel Pilot",
  description: "Watch the pilot fly. The Pixel Pilot brand film: one struggling shop, one takeoff, one flight from empty runway to landmark.",
};

export default function FilmPage() {
  return (
    <>
      <BrandFilm />
      <FinalCTA />
    </>
  );
}
