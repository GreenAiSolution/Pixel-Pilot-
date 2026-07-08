import type { Metadata } from "next";
import { BrandFilm, FinalCTA } from "@/components/pixel-pilot/sections";

export const metadata: Metadata = {
  title: "Brand Film — Pixel Pilot",
  description: "Watch the pilot fly: one pass from Pixel Pilot turns a struggling shop into a landmark.",
};

export default function FilmPage() {
  return (
    <>
      <BrandFilm />
      <FinalCTA />
    </>
  );
}
