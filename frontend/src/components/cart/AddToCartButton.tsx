import { Check, Plus } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { STRINGS } from "../../lib/strings";

interface Props {
  name: string;
  source: string | null;
  /** "sm" for dense table rows, "md" for cards. */
  size?: "sm" | "md";
}

export function AddToCartButton({ name, source, size = "sm" }: Props) {
  const { has, add, remove } = useCart();
  const inCart = has(name);

  const pad = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const icon = size === "sm" ? 12 : 14;

  return (
    <button
      type="button"
      aria-pressed={inCart}
      aria-label={inCart ? `${STRINGS.removeFromCart}: ${name}` : `${STRINGS.addToCart}: ${name}`}
      onClick={() => (inCart ? remove(name) : add({ name, source }))}
      className={`inline-flex items-center gap-1 ${pad} rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
        inCart
          ? "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 hover:bg-emerald-100"
          : "text-indigo-600 bg-indigo-50 ring-1 ring-indigo-200 hover:bg-indigo-100"
      }`}
    >
      {inCart ? (
        <>
          <Check size={icon} aria-hidden="true" />
          {STRINGS.addedToCart}
        </>
      ) : (
        <>
          <Plus size={icon} aria-hidden="true" />
          {STRINGS.addToCart}
        </>
      )}
    </button>
  );
}
