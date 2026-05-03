import { Star } from "lucide-react";

interface Props {
  rating: string | null;
}

export function RatingStars({ rating }: Props) {
  if (!rating) return <span className="text-white/30 text-xs">—</span>;

  const numeric = parseFloat(rating);
  if (isNaN(numeric)) return <span className="text-white/50 text-xs">{rating}</span>;

  const full = Math.floor(numeric);
  const partial = numeric - full;

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < full;
        const isPartial = i === full && partial >= 0.5;
        return (
          <Star
            key={i}
            size={11}
            className={filled || isPartial ? "text-amber-400" : "text-white/15"}
            fill={filled ? "currentColor" : isPartial ? "currentColor" : "none"}
            aria-hidden="true"
          />
        );
      })}
      <span className="ml-1 text-xs text-white/50">{numeric.toFixed(1)}</span>
    </span>
  );
}
