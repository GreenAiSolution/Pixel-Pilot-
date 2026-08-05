// ─── CALL SCRIPTS ────────────────────────────────────────────────────────────
// Every transcript on this site is a real exchange the engine can actually
// handle — the intents, the slots and the outcomes all exist in
// ~/phxgrowth-engine. Nothing here is a capability we haven't built.
//
// Timings are milliseconds from the first ring. RING_MS of silence, then the
// turns land in order.

export type Turn = { at: number; who: "agent" | "caller"; text: string };
export type Slot = { at: number; k: string; v: string; hot?: boolean };
export type OutcomeKind = "booked" | "escalated" | "screened" | "confirmed" | "revived";
export type Outcome = { at: number; kind: OutcomeKind; label: string; note: string };

export type Call = {
  from: string;
  when: string;
  turns: Turn[];
  slots: Slot[];
  outcome: Outcome;
  end: number;
};

export const RING_MS = 2400;

export const TONE: Record<OutcomeKind, string> = {
  booked: "var(--ag-signal)",
  confirmed: "var(--ag-signal)",
  revived: "var(--ag-signal)",
  escalated: "var(--ag-alarm)",
  screened: "var(--ag-mute)",
};

// ─── IVY · the receptionist ──────────────────────────────────────────────────
export const IVY_CALLS: Call[] = [
  {
    from: "(480) 555-0198",
    when: "9:14 PM · after hours",
    turns: [
      { at: 2600, who: "agent", text: "Desert Air, this is Ivy — what's going on?" },
      { at: 4600, who: "caller", text: "AC quit and it's 108 out" },
      { at: 6200, who: "agent", text: "I can get someone there tomorrow morning. What's the address?" },
      { at: 8400, who: "caller", text: "1420 East Osborn" },
      { at: 9800, who: "agent", text: "Booked. Confirmation text is on its way." },
    ],
    slots: [
      { at: 5000, k: "Issue", v: "AC not cooling" },
      { at: 8800, k: "Address", v: "1420 E Osborn" },
      { at: 10000, k: "Window", v: "Tomorrow AM" },
    ],
    outcome: { at: 10800, kind: "booked", label: "Booked", note: "Job on the calendar. You slept through it." },
    end: 14200,
  },
  {
    from: "(602) 555-0111",
    when: "2:41 AM · after hours",
    turns: [
      { at: 2600, who: "agent", text: "Desert Air, this is Ivy — what's going on?" },
      { at: 4400, who: "caller", text: "There's water pouring out under the sink" },
      { at: 5900, who: "agent", text: "That's an emergency. I'm getting someone now — address?" },
      { at: 8000, who: "caller", text: "88 West Cactus" },
      { at: 9300, who: "agent", text: "Connecting you to the on-call tech. Stay on the line." },
    ],
    slots: [
      { at: 4800, k: "Issue", v: "Burst line — flooding", hot: true },
      { at: 8400, k: "Address", v: "88 W Cactus" },
    ],
    outcome: { at: 10200, kind: "escalated", label: "Escalated", note: "Your phone rang 40 seconds in. Worth waking up for." },
    end: 13600,
  },
  {
    from: "(800) 555-0000",
    when: "11:02 AM · working hours",
    turns: [
      { at: 2600, who: "agent", text: "Desert Air, this is Ivy — what's going on?" },
      { at: 4400, who: "caller", text: "Calling about SEO services for your website" },
      { at: 6000, who: "agent", text: "Not interested — please take this number off your list." },
    ],
    slots: [{ at: 4800, k: "Caller", v: "Sales pitch" }],
    outcome: { at: 7200, kind: "screened", label: "Screened", note: "The fourth one this week. You heard none of them." },
    end: 10400,
  },
];

// ─── DEX · the dispatcher ────────────────────────────────────────────────────
export const DEX_CALLS: Call[] = [
  {
    from: "(623) 555-0140",
    when: "7:02 AM · outbound",
    turns: [
      { at: 2600, who: "agent", text: "Morning — Dex from Desert Air. Confirming your 9 to 11 window today." },
      { at: 5000, who: "caller", text: "Yeah still good. Any chance it's earlier?" },
      { at: 6600, who: "agent", text: "Tech's two streets away after his first stop — I'll aim him at you next." },
      { at: 8800, who: "caller", text: "Perfect" },
      { at: 10000, who: "agent", text: "You'll get a text when he's rolling." },
    ],
    slots: [
      { at: 5400, k: "Job", v: "Confirmed · today" },
      { at: 7000, k: "Window", v: "Moved to 9:00" },
      { at: 10200, k: "Notify", v: "On-the-way text queued" },
    ],
    outcome: { at: 11000, kind: "confirmed", label: "Confirmed", note: "Six of these before you finished your coffee." },
    end: 14400,
  },
  {
    from: "(480) 555-0177",
    when: "1:18 PM · inbound",
    turns: [
      { at: 2600, who: "agent", text: "Desert Air, this is Dex." },
      { at: 4200, who: "caller", text: "I need to move Thursday, something came up" },
      { at: 5800, who: "agent", text: "No problem. I have Friday morning or Monday afternoon." },
      { at: 8000, who: "caller", text: "Friday works" },
      { at: 9200, who: "agent", text: "Moved. Your tech's been told, and the slot's back on the board." },
    ],
    slots: [
      { at: 4600, k: "Request", v: "Reschedule" },
      { at: 8400, k: "New date", v: "Friday AM" },
      { at: 9400, k: "Slot", v: "Released for rebooking" },
    ],
    outcome: { at: 10200, kind: "confirmed", label: "Rescheduled", note: "The empty Thursday slot went back on the board." },
    end: 13600,
  },
];

// ─── RAE · the follow-up rep ─────────────────────────────────────────────────
export const RAE_CALLS: Call[] = [
  {
    from: "(602) 555-0166",
    when: "Day 21 after the quote",
    turns: [
      { at: 2600, who: "agent", text: "Hi Marcus — Rae at Desert Air, about the condenser quote from a few weeks back." },
      { at: 5200, who: "caller", text: "Right, I've been putting it off" },
      { at: 6800, who: "agent", text: "Understood. It's still good at the quoted price this month — want me to hold a slot?" },
      { at: 9200, who: "caller", text: "Go on then, next week" },
      { at: 10400, who: "agent", text: "Holding Tuesday. I'll pass you to the office to confirm." },
    ],
    slots: [
      { at: 5600, k: "Quote", v: "$4,180 · 21 days old" },
      { at: 9600, k: "Outcome", v: "Slot held · Tuesday" },
      { at: 10600, k: "Handoff", v: "To a human" },
    ],
    outcome: { at: 11200, kind: "revived", label: "Revived", note: "A quote you'd written off. She works the whole list." },
    end: 14600,
  },
];
