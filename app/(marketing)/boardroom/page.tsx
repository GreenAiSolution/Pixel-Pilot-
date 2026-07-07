import Link from 'next/link';
import { listBoardMeetings, runBoardMeeting, BOARD_MEMBERS, type BoardMeeting } from '@/pixel-pilot';

// Minutes are generated on the fly, so never statically cache this route.
export const dynamic = 'force-dynamic';

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function BoardroomPage() {
  let meetings: BoardMeeting[] = await listBoardMeetings(30);
  // Seed today's meeting so the room is never empty on a fresh install.
  if (meetings.length === 0) {
    await runBoardMeeting();
    meetings = await listBoardMeetings(30);
  }

  return (
    <div className="relative">
      <section className="px-6 pt-28 pb-16">
        <div className="container mx-auto max-w-5xl">
          <div className="text-xs uppercase tracking-[0.3em] text-[#6C63FF]">
            ── The Boardroom
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg,#00D4FF,#6C63FF,#FF2E9A)' }}
            >
              The daily board meeting.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary leading-relaxed">
            Every morning at 6am, three AI executives meet, read the overnight numbers, and leave
            behind the minutes. Here is the standing board and every meeting on record.
          </p>

          {/* The standing board */}
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {BOARD_MEMBERS.map((m) => {
              const accent =
                m.id === 'atlas' ? '#00D4FF' : m.id === 'nova' ? '#FF2E9A' : '#6C63FF';
              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{ background: accent, boxShadow: `0 0 20px ${accent}66` }}
                    >
                      {m.name[0]}
                    </span>
                    <div>
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-text-tertiary">
                        {m.role}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed">{m.mandate}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meeting log */}
      <section className="px-6 pb-28">
        <div className="container mx-auto max-w-5xl">
          <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary mb-6">
            ── Minutes on record
          </div>
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/boardroom/${meeting.date}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 hover:border-white/25 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">{formatDate(meeting.date)}</div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-widest text-text-tertiary">
                      {meeting.briefs.length} briefs · {meeting.decisions.length} decisions ·{' '}
                      {meeting.actionItems.length} action items
                    </div>
                  </div>
                  <span className="shrink-0 text-text-tertiary group-hover:translate-x-1 transition">
                    →
                  </span>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-2">
                  {meeting.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
