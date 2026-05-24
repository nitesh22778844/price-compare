import { STRINGS } from "./strings";
import type { BuySuggestion } from "./types";

export interface SuggestionTheme {
  label: string;
  bg: string;
  fg: string;
  ring: string;
  dot: string;
}

const SUGGESTION_THEMES: Record<BuySuggestion, SuggestionTheme> = {
  frequent: {
    label: STRINGS.suggestionFrequent,
    bg: "#ECFDF5", // emerald-50
    fg: "#047857", // emerald-700
    ring: "#A7F3D0", // emerald-200
    dot: "#10B981", // emerald-500
  },
  restock: {
    label: STRINGS.suggestionRestock,
    bg: "#EEF2FF", // indigo-50
    fg: "#4338CA", // indigo-700
    ring: "#C7D2FE", // indigo-200
    dot: "#6366F1", // indigo-500
  },
  recent: {
    label: STRINGS.suggestionRecent,
    bg: "#F1F5F9", // slate-100
    fg: "#475569", // slate-600
    ring: "#CBD5E1", // slate-300
    dot: "#94A3B8", // slate-400
  },
  new: {
    label: STRINGS.suggestionNew,
    bg: "#FFFBEB", // amber-50
    fg: "#92400E", // amber-800
    ring: "#FDE68A", // amber-200
    dot: "#F59E0B", // amber-500
  },
};

export function getSuggestionTheme(label: BuySuggestion): SuggestionTheme {
  return SUGGESTION_THEMES[label];
}

export const SUGGESTION_LABELS = Object.keys(
  SUGGESTION_THEMES,
) as BuySuggestion[];
