"use client";

// ─── PHX GROWTH · HOME ───────────────────────────────────────────────────────
// One pitch, top to bottom: we put an AI employee on your phones.
// Nothing on this page sells advertising. See ~/phxgrowth-engine/SERVICES.md.

import {
  EmployeeHero,
  TheLeak,
  MeetIvy,
  WhatSheDoes,
  HowItGoesLive,
  EmployeeCTA,
} from "@/components/pixel-pilot/employees";

export default function PhxGrowthHome() {
  return (
    <div className="relative">
      <EmployeeHero />
      <TheLeak />
      <MeetIvy />
      <WhatSheDoes />
      <HowItGoesLive />
      <EmployeeCTA />
    </div>
  );
}
