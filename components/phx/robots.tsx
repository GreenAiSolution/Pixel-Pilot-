"use client";

// ─── THE CREW ────────────────────────────────────────────────────────────────
// Three robots, drawn rather than generated, for three reasons that all matter
// on this particular site:
//
//   · They hold the exact palette. A generated headshot drifts off-brand; these
//     are built from the same amber/ink tokens as everything else.
//   · They are alive. Ivy blinks, Dex sweeps a scan bar on a metronome, Rae's
//     iris drifts and narrows. A static portrait cannot show a status LED go
//     green the moment a call connects.
//   · They weigh nothing and scale to any size, so the same component is a
//     96px portrait on /employees and a 26px avatar inside the console header.
//
// Design rule: these are *equipment*, not mascots. Chamfered plate, visible
// seams, an indicator lamp. The audience buys machines that work; a cartoon
// would undercut the whole instrument aesthetic.

export type Who = "ivy" | "dex" | "rae";

export const CREW: Record<
  Who,
  {
    name: string;
    role: string;
    tone: string;
    dim: string;
    line: string; // how they'd describe the job themselves
    quirk: string;
    job: string;
    hours: string;
    cost: string;
  }
> = {
  ivy: {
    name: "Ivy",
    role: "Receptionist",
    tone: "#ffb44a",
    dim: "rgba(255,180,74,0.18)",
    line: "I don't put anyone on hold.",
    quirk: "Has never once said “please listen carefully, our options have changed.”",
    job: "Answers every call, books the job, screens the pitches, and wakes a human when someone's house is flooding.",
    hours: "24 / 7",
    cost: "$899",
  },
  dex: {
    name: "Dex",
    role: "Dispatcher",
    tone: "#4fd1a5",
    dim: "rgba(79,209,165,0.18)",
    line: "Nobody waits on me.",
    quirk: "Confirms tomorrow's board at 6:58am. Every day. Including Sunday.",
    job: "Confirms tomorrow's jobs before you're awake, handles reschedules, and texts the customer when the tech is rolling.",
    hours: "6am – 8pm",
    cost: "+$691",
  },
  rae: {
    name: "Rae",
    role: "Follow-up",
    tone: "#9b8cff",
    dim: "rgba(155,140,255,0.18)",
    line: "I don't take it personally.",
    quirk: "Will politely ask a fourth time. Has no ego to bruise.",
    job: "Works every quote that went quiet and every customer who hasn't called in a year. Hands the live ones to you.",
    hours: "Weekdays",
    cost: "+$600",
  },
};

type Status = "idle" | "live" | "ringing";

export function Robot({
  who,
  size = 96,
  status = "idle",
  className = "",
}: {
  who: Who;
  size?: number;
  status?: Status;
  className?: string;
}) {
  const c = CREW[who];
  const lamp = status === "live" ? "#4fd1a5" : status === "ringing" ? "#ffb44a" : c.tone;

  return (
    <svg
      className={`ag-robot ag-robot--${who} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${c.name}, ${c.role.toLowerCase()}`}
      style={{ ["--bot" as string]: c.tone, ["--botdim" as string]: c.dim }}
    >
      <defs>
        <radialGradient id={`glow-${who}`} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor={c.tone} stopOpacity="0.22" />
          <stop offset="100%" stopColor={c.tone} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`plate-${who}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#212c37" />
          <stop offset="100%" stopColor="#131b24" />
        </linearGradient>
      </defs>

      {/* port: the socket each of them sits in */}
      <circle cx="60" cy="60" r="57" fill="#0d141c" stroke={c.dim} strokeWidth="1.5" />
      <circle cx="60" cy="60" r="57" fill={`url(#glow-${who})`} />

      <g className="ag-robot__body">
        {who === "ivy" && <Ivy tone={c.tone} />}
        {who === "dex" && <Dex tone={c.tone} />}
        {who === "rae" && <Rae tone={c.tone} />}
      </g>

      {/* status lamp — the one thing that changes when they're working */}
      <g className="ag-robot__lamp">
        <circle cx="100" cy="100" r="8" fill="#0d141c" stroke={c.dim} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="3.6" fill={lamp}>
          {status !== "idle" && (
            <animate attributeName="opacity" values="1;0.35;1" dur="1.4s" repeatCount="indefinite" />
          )}
        </circle>
      </g>
    </svg>
  );
}

// ─── IVY · soft plate, wide visor, headset. Attentive. ───────────────────────
function Ivy({ tone }: { tone: string }) {
  return (
    <g>
      {/* headset band */}
      <path
        d="M31 60a29 29 0 0 1 58 0"
        fill="none"
        stroke="#3a4753"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="25" y="55" width="9" height="19" rx="4.5" fill="#2a3640" />
      <rect x="86" y="55" width="9" height="19" rx="4.5" fill="#2a3640" />

      {/* head */}
      <rect x="33" y="41" width="54" height="48" rx="17" fill="url(#plate-ivy)" stroke="#3d4b58" strokeWidth="1.5" />
      {/* seam */}
      <line x1="33" y1="64" x2="87" y2="64" stroke="#2b3742" strokeWidth="1" />

      {/* visor */}
      <rect x="40" y="52" width="40" height="18" rx="9" fill="#0a1016" stroke={tone} strokeOpacity="0.45" strokeWidth="1" />
      {/* eyes — blink together, with a long natural pause */}
      <g className="ag-eye-blink">
        <circle cx="51" cy="61" r="4.3" fill={tone} />
        <circle cx="69" cy="61" r="4.3" fill={tone} />
      </g>

      {/* mic boom + tip that pulses when she speaks */}
      <path d="M89 68q9 6 3 14" fill="none" stroke="#3a4753" strokeWidth="3" strokeLinecap="round" />
      <circle className="ag-mic" cx="92" cy="83" r="3.4" fill={tone} />

      {/* chin plate */}
      <rect x="50" y="78" width="20" height="5" rx="2.5" fill="#2b3742" />
    </g>
  );
}

// ─── DEX · boxier chassis, scanning bar, metronome beacon. Punctual. ─────────
function Dex({ tone }: { tone: string }) {
  return (
    <g>
      {/* antenna + beacon on a strict interval — he is never late */}
      <line x1="60" y1="26" x2="60" y2="38" stroke="#3a4753" strokeWidth="3" strokeLinecap="round" />
      <circle className="ag-beacon" cx="60" cy="24" r="4" fill={tone} />

      {/* head: chamfered, mechanical */}
      <path
        d="M38 40h44l6 6v34l-6 6H38l-6-6V46z"
        fill={`url(#plate-dex)`}
        stroke="#3d4b58"
        strokeWidth="1.5"
      />
      {/* vents */}
      <line x1="40" y1="78" x2="52" y2="78" stroke="#26313b" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="83" x2="52" y2="83" stroke="#26313b" strokeWidth="2" strokeLinecap="round" />
      <line x1="68" y1="78" x2="80" y2="78" stroke="#26313b" strokeWidth="2" strokeLinecap="round" />
      <line x1="68" y1="83" x2="80" y2="83" stroke="#26313b" strokeWidth="2" strokeLinecap="round" />

      {/* eye slot with a bar that sweeps across it */}
      <rect x="40" y="53" width="40" height="14" rx="4" fill="#0a1016" stroke={tone} strokeOpacity="0.4" strokeWidth="1" />
      <clipPath id="dex-slot">
        <rect x="41" y="54" width="38" height="12" rx="3.5" />
      </clipPath>
      <g clipPath="url(#dex-slot)">
        <rect className="ag-scan" x="41" y="54" width="11" height="12" rx="3" fill={tone} />
      </g>
    </g>
  );
}

// ─── RAE · tilted plate, one patient lens, signal arcs. Persistent. ──────────
function Rae({ tone }: { tone: string }) {
  return (
    <g transform="rotate(-5 60 62)">
      {/* aerial with outgoing signal — she is always reaching out */}
      <line x1="76" y1="34" x2="83" y2="24" stroke="#3a4753" strokeWidth="3" strokeLinecap="round" />
      <circle cx="84" cy="22" r="3.2" fill={tone} />
      <g className="ag-signal" stroke={tone} fill="none" strokeLinecap="round">
        <path d="M89 20a8 8 0 0 1 0 8" strokeWidth="1.8" opacity="0.85" />
        <path d="M93 16a15 15 0 0 1 0 16" strokeWidth="1.6" opacity="0.5" />
      </g>

      {/* head: rounded hex */}
      <path
        d="M60 38l22 10v26l-22 12-22-12V48z"
        fill={`url(#plate-rae)`}
        stroke="#3d4b58"
        strokeWidth="1.5"
      />

      {/* one wide lens; the iris drifts and narrows */}
      <ellipse cx="60" cy="60" rx="19" ry="12" fill="#0a1016" stroke={tone} strokeOpacity="0.42" strokeWidth="1" />
      <g className="ag-iris">
        <circle cx="60" cy="60" r="6.4" fill={tone} />
        <circle cx="62.2" cy="57.8" r="1.9" fill="#0a1016" opacity="0.55" />
      </g>

      {/* jaw seam */}
      <line x1="47" y1="76" x2="73" y2="76" stroke="#26313b" strokeWidth="1.5" />
    </g>
  );
}

// The plate gradients are defined per-instance above; these aliases keep the
// three head components readable without threading ids through props.
export function RobotDefs() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
      <defs>
        {(["ivy", "dex", "rae"] as Who[]).map((w) => (
          <linearGradient key={w} id={`plate-${w}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b242e" />
            <stop offset="100%" stopColor="#10171f" />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}
