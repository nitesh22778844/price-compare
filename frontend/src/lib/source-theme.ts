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

export function getSourceTheme(source: string): SourceTheme {
  return THEMES[source] ?? { accent: "#6B7280", label: source };
}

export const SUPPORTED_SOURCES = Object.keys(THEMES);
