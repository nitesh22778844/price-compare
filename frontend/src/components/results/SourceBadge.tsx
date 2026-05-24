import { getSourceTheme } from "../../lib/source-theme";
import { getBrandLogo } from "./brand-logos";

interface Props {
  source: string;
}

export function SourceBadge({ source }: Props) {
  const theme = getSourceTheme(source);
  const Logo = getBrandLogo(source);

  if (Logo) {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-md bg-white ring-1 ring-slate-200 whitespace-nowrap"
        aria-label={`Source: ${theme.label}`}
      >
        <Logo height={14} />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white whitespace-nowrap"
      style={{ backgroundColor: theme.accent }}
      aria-label={`Source: ${theme.label}`}
    >
      {theme.label}
    </span>
  );
}
