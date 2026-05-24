export interface SourceTheme {
  accent: string;
  label: string;
}

const THEMES: Record<string, SourceTheme> = {
  Amazon: { accent: "#FF9900", label: "Amazon" },
  Flipkart: { accent: "#2874F0", label: "Flipkart" },
  Croma: { accent: "#27C14D", label: "Croma" },
  "Reliance Digital": { accent: "#C8102E", label: "RD" },
};

const LOOKUP: Record<string, string> = Object.fromEntries(
  Object.keys(THEMES).map((k) => [k.toLowerCase(), k]),
);

export function getSourceTheme(source: string): SourceTheme {
  const matched = LOOKUP[source.toLowerCase().trim()];
  if (matched) return THEMES[matched];
  return { accent: "#6B7280", label: source };
}

export const SUPPORTED_SOURCES = Object.keys(THEMES);
