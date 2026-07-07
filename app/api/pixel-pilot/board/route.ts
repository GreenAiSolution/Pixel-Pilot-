// ─── PIXEL PILOT · BOARD MEETING API ─────────────────────────────────────────
// GET  /api/pixel-pilot/board            → recent meetings (listBoardMeetings)
// GET  /api/pixel-pilot/board?date=YYYY-MM-DD → one day's minutes (or 404)
// POST /api/pixel-pilot/board            → run a meeting now and return the minutes
//
// Everything degrades gracefully: with no ANTHROPIC_API_KEY the briefs are
// simulated, and with no KV the meeting is held in memory for the process.

import { NextRequest, NextResponse } from 'next/server';
import { runBoardMeeting, getBoardMeeting, listBoardMeetings } from '@/pixel-pilot';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');

  if (date) {
    const meeting = await getBoardMeeting(date);
    if (!meeting) {
      return NextResponse.json({ error: 'No meeting on that date', date }, { status: 404 });
    }
    return NextResponse.json({ ok: true, meeting });
  }

  const limitParam = req.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam) || 30)) : 30;
  const meetings = await listBoardMeetings(limit);
  return NextResponse.json({ ok: true, count: meetings.length, meetings });
}

export async function POST(req: NextRequest) {
  let body: { date?: string } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is fine — defaults to today.
  }

  const meeting = await runBoardMeeting(body.date ? { date: body.date } : {});
  return NextResponse.json({ ok: true, meeting });
}
