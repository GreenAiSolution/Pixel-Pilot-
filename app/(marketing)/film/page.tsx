import type { Metadata } from "next";
import { BrandFilm, FinalCTA } from "@/components/phx-growth/sections";

export const metadata: Metadata = {
  title: "Brand Film — PHX Growth",
  description: "Watch the pilot fly. The PHX Growth brand film: one struggling shop, one takeoff, one flight from empty runway to landmark.",
};

export default function FilmPage() {
  return (
    <>
      <BrandFilm />
      <FinalCTA />
    </>
  );
}
