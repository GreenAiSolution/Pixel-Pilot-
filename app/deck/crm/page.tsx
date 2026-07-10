// ─── PIXEL PILOT · /deck/crm ─────────────────────────────────────────────────
// The Orbital CRM behind the operator gate. Server component: reads the deck
// cookie, renders the lock screen unless the request is authorized (or the
// deck is open in dev with no key configured).

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { CrmDeck } from '@/components/pixel-pilot/crm-deck';
import { DeckGate } from '@/components/pixel-pilot/deck-gate';
import { DECK_COOKIE, deckCookieAllowed } from '@/pixel-pilot/deck-auth';

export const metadata: Metadata = {
  title: 'Orbital CRM — Operator Deck',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DeckCrmPage() {
  const jar = await cookies();
  const { allowed, access } = deckCookieAllowed(jar.get(DECK_COOKIE)?.value);
  if (!allowed) return <DeckGate locked={access === 'locked-unconfigured'} />;
  return <CrmDeck />;
}
