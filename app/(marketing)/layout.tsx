import { AgenticShell } from '@/components/phx/agentic-shell';

// PHX Growth Agentic chrome. Scoped to this route group so sibling apps
// (/eagle, /deck) keep rendering their own.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <AgenticShell>{children}</AgenticShell>;
}
