import { ExternalLink } from "lucide-react";
import type { ProductListing } from "../../lib/types";
import { getSourceTheme } from "../../lib/source-theme";
import { STRINGS } from "../../lib/strings";
import { SourceBadge } from "./SourceBadge";
import { RatingStars } from "./RatingStars";

interface Props {
  results: ProductListing[];
  loading: boolean;
  error: string | null;
}

function formatINR(amount: number | null): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatReviews(count: number | null): string {
  if (count === null) return "—";
  if (count >= 100_000) return `${(count / 100_000).toFixed(1)}L`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return String(count);
}

function groupBySource(listings: ProductListing[]): Map<string, ProductListing[]> {
  const map = new Map<string, ProductListing[]>();
  for (const item of listings) {
    const existing = map.get(item.source) ?? [];
    existing.push(item);
    map.set(item.source, existing);
  }
  return map;
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 9 }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="shimmer h-4 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <span className="text-3xl" role="img" aria-label="search">🔍</span>
      </div>
      <p className="text-white/70 font-medium">{STRINGS.tableEmptyHeading}</p>
      <p className="text-white/30 text-sm mt-1">{STRINGS.tableEmptySubtext}</p>
    </div>
  );
}

export function ComparisonTable({ results, loading, error }: Props) {
  const groups = groupBySource(results);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto scrollbar-thin">
        {loading ? (
          <table className="w-full border-collapse text-sm" aria-label="Loading product results">
            <TableHeader />
            <tbody>
              {Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
              <span className="text-2xl" role="img" aria-label="error">⚠️</span>
            </div>
            <p className="text-red-400 font-medium">{STRINGS.tableErrorHeading}</p>
            <p className="text-white/30 text-sm mt-1">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="w-full border-collapse text-sm" aria-label="Product comparison results">
            <TableHeader />
            <tbody>
              {Array.from(groups.entries()).map(([source, items]) => (
                <SourceGroup key={source} source={source} items={items} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TableHeader() {
  return (
    <thead className="sticky top-0 z-10" style={{ background: 'rgba(7, 9, 26, 0.9)', backdropFilter: 'blur(12px)' }}>
      <tr className="border-b border-white/10">
        {[
          STRINGS.columnName,
          STRINGS.columnSource,
          STRINGS.columnCurrentPrice,
          STRINGS.columnOriginalPrice,
          STRINGS.columnDiscount,
          STRINGS.columnRating,
          STRINGS.columnReviews,
          STRINGS.columnRank,
          STRINGS.columnLink,
        ].map((col, i) => (
          <th
            key={i}
            className={`px-4 py-3 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap ${
              i >= 2 && i <= 7 ? "text-right" : ""
            }`}
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

interface SourceGroupProps {
  source: string;
  items: ProductListing[];
}

function SourceGroup({ source, items }: SourceGroupProps) {
  const theme = getSourceTheme(source);
  return (
    <>
      <tr>
        <td
          colSpan={9}
          className="px-4 py-2 border-y border-white/10"
          style={{ background: `${theme.accent}12` }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
              style={{ backgroundColor: theme.accent, boxShadow: `0 0 6px ${theme.accent}60` }}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold" style={{ color: theme.accent }}>
              {source}
            </span>
            <span className="text-xs text-white/30">
              — {items.length} {items.length === 1 ? "result" : "results"}
            </span>
          </div>
        </td>
      </tr>
      {items.map((item, idx) => (
        <ProductRow key={item.id} item={item} isTopMatch={idx === 0} accent={theme.accent} />
      ))}
    </>
  );
}

interface ProductRowProps {
  item: ProductListing;
  isTopMatch: boolean;
  accent: string;
}

function ProductRow({ item, isTopMatch, accent }: ProductRowProps) {
  return (
    <tr
      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-100"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      {/* Product name + image */}
      <td className="px-4 py-3 max-w-[240px]">
        <div className="flex items-start gap-3">
          <ProductImage url={item.image_url} accent={accent} />
          <div className="min-w-0">
            <p
              className="font-medium text-white/90 line-clamp-2 text-xs leading-snug"
              title={item.title}
            >
              {item.title}
            </p>
            {isTopMatch && (
              <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                {STRINGS.topMatchBadge}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Source */}
      <td className="px-4 py-3 whitespace-nowrap">
        <SourceBadge source={item.source} />
      </td>

      {/* Current price */}
      <td className="px-4 py-3 text-right font-semibold text-white whitespace-nowrap text-xs">
        {formatINR(item.current_price)}
      </td>

      {/* Original price */}
      <td className="px-4 py-3 text-right whitespace-nowrap">
        {item.original_price && item.current_price && item.original_price > item.current_price ? (
          <span className="text-white/30 line-through text-xs">
            {formatINR(item.original_price)}
          </span>
        ) : (
          <span className="text-white/30 text-xs">{formatINR(item.original_price)}</span>
        )}
      </td>

      {/* Discount */}
      <td className="px-4 py-3 text-right">
        {item.discount !== null && item.discount > 0 ? (
          <span className="inline-block bg-emerald-400/15 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/20">
            -{item.discount}%
          </span>
        ) : (
          <span className="text-white/20 text-xs">—</span>
        )}
      </td>

      {/* Rating */}
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end">
          <RatingStars rating={item.rating} />
        </div>
      </td>

      {/* Reviews */}
      <td className="px-4 py-3 text-right text-xs text-white/50 whitespace-nowrap">
        {formatReviews(item.review_count)}
      </td>

      {/* Rank */}
      <td className="px-4 py-3 text-right text-xs text-white/50">
        {item.rank !== null ? `#${item.rank}` : STRINGS.noRankLabel}
      </td>

      {/* View link */}
      <td className="px-4 py-3">
        {item.product_url ? (
          <a
            href={item.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 whitespace-nowrap transition-colors"
            aria-label={`View ${item.title} on ${item.source}`}
          >
            {STRINGS.viewButtonLabel}
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        ) : (
          <span className="text-white/20 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}

interface ProductImageProps {
  url: string | null;
  accent: string;
}

function ProductImage({ url, accent }: ProductImageProps) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white/10 p-0.5"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          el.style.display = "none";
          const fallback = el.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "flex";
        }}
        aria-hidden="true"
      />
    );
  }
  return (
    <div
      className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
      style={{ background: `${accent}18`, border: `1px solid ${accent}25` }}
      aria-hidden="true"
    >
      <span className="text-base">📦</span>
    </div>
  );
}
