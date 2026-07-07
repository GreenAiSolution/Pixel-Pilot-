import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBoardMeeting, runBoardMeeting, toDateKey, type BoardMeeting } from '@/pixel-pilot';

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

function accentFor(memberId: string): string {
  return memberId === 'atlas' ? '#00D4FF' : memberId === 'nova' ? '#FF2E9A' : '#6C63FF';
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function BoardMeetingPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  let meeting: BoardMeeting | null = await getBoardMeeting(date);
  // If it's today and no minutes exist yet, hold the meeting on demand.
  if (!meeting && date === toDateKey()) {
    meeting = await runBoardMeeting({ date });
  }
  if (!meeting) notFound();

  return (
    <div className="relative">
      <section className="px-6 pt-28 pb-16">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/boardroom"
            className="text-xs uppercase tracking-[0.3em] text-text-tertiary hover:text-text-secondary transition"
          >
            ← The Boardroom
          </Link>
          <div className="mt-4 text-xs uppercase tracking-[0.3em] text-[#6C63FF]">
            ── Board minutes
          </div>
          <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
            {formatDate(meeting.date)}
          </h1>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed">{meeting.summary}</p>

          {/* Agenda */}
          <div className="mt-12">
            <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary mb-4">
              ── Agenda
            </div>
            <ol className="space-y-2">
              {meeting.agenda.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-0.5 font-mono text-xs text-[#00D4FF]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Briefs */}
          <div className="mt-12">
            <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary mb-4">
              ── Executive briefs
            </div>
            <div className="grid gap-4">
              {meeting.briefs.map((b) => {
                const accent = accentFor(b.memberId);
                return (
                  <div
                    key={b.memberId}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 overflow-hidden"
                    style={{ borderTop: `2px solid ${accent}66` }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                        style={{ background: accent, boxShadow: `0 0 20px ${accent}66` }}
                      >
                        {b.name[0]}
                      </span>
                      <div>
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-text-tertiary">
                          {b.role}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-text-secondary leading-relaxed">{b.brief}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decisions */}
          <div className="mt-12">
            <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary mb-4">
              ── Decisions
            </div>
            <ul className="space-y-2.5">
              {meeting.decisions.map((d, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#FF2E9A] shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action items */}
          <div className="mt-12">
            <div className="text-xs uppercase tracking-[0.3em] text-text-tertiary mb-4">
              ── Action items
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {meeting.actionItems.map((a, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5"
                >
                  <div className="text-[10px] uppercase tracking-widest text-[#6C63FF]">
                    {a.owner}
                  </div>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">{a.task}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-[11px] uppercase tracking-widest text-text-tertiary">
            Minutes recorded {new Date(meeting.createdAt).toISOString()}
          </div>
        </div>
      </section>
    </div>
  );
}
