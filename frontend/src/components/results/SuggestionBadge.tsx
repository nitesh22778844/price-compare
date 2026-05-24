import { Check } from "lucide-react";
import { getSuggestionTheme } from "../../lib/suggestion-theme";
import type { BuySuggestion } from "../../lib/types";

interface Props {
  label: BuySuggestion | null;
  reason: string | null;
}

export function SuggestionBadge({ label, reason }: Props) {
  if (!label) return null;
  const theme = getSuggestionTheme(label);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide whitespace-nowrap fade-up ring-1"
      style={{
        backgroundColor: theme.bg,
        color: theme.fg,
        boxShadow: `inset 0 0 0 1px ${theme.ring}`,
      }}
      title={reason ?? undefined}
      aria-label={
        reason ? `${theme.label} — ${reason}` : theme.label
      }
    >
      {label === "frequent" ? (
        <Check className="w-3 h-3" strokeWidth={3} />
      ) : (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: theme.dot }}
          aria-hidden
        />
      )}
      {theme.label}
    </span>
  );
}
