// ─── PIXEL PILOT · BOARD MEETING CRON ────────────────────────────────────────
// GET /api/pixel-pilot/board/cron  (Vercel Cron issues GET only)
// Runs the daily board meeting, persists the minutes, then posts a Slack message
// via the user's Zapier Catch Hook pointing at the /boardroom/{date} page.
//
// Protection: when CRON_SECRET is set, the request must carry
// `Authorization: Bearer ${CRON_SECRET}` (Vercel sends this automatically) or it
// is rejected 401. When CRON_SECRET is unset the endpoint is open, so the demo
// runs with an empty .env. Slack notification degrades to a dry-run receipt when
// ZAPIER_HOOK_URL is absent.

import { NextRequest, NextResponse } from 'next/server';
import { runBoardMeeting } from '@/pixel-pilot';
import { fireZapier } from '@/pixel-pilot/executor';

function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://pixel-pilot.app';
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const meeting = await runBoardMeeting();
  const url = `${baseUrl()}/boardroom/${meeting.date}`;
  const message = `🛎️ Pixel Pilot board meeting for ${meeting.date} is ready`;

  const receipt = await fireZapier('board_meeting_ready', {
    message,
    url,
    date: meeting.date,
    meetingId: meeting.id,
    summary: meeting.summary,
  });

  return NextResponse.json({
    ok: true,
    meetingId: meeting.id,
    date: meeting.date,
    url,
    slack: receipt.configured ? (receipt.ok ? 'sent' : 'failed') : 'dry-run',
    protected: Boolean(secret),
  });
}
