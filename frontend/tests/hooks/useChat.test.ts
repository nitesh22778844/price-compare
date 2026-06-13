import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useChat } from "../../src/hooks/useChat";
import { STRINGS } from "../../src/lib/strings";
import { api } from "../../src/lib/api";

vi.mock("../../src/lib/api", () => ({
  api: {
    chat: vi.fn(),
    searchProducts: vi.fn(),
    searchProductsFlipkart: vi.fn(),
  },
}));

const mockApi = api as unknown as {
  chat: ReturnType<typeof vi.fn>;
  searchProducts: ReturnType<typeof vi.fn>;
  searchProductsFlipkart: ReturnType<typeof vi.fn>;
};

const PQ = { query: "OnePlus 12" };
const FAKE_LISTING = {
  id: "1", title: "OnePlus 12", source: "Amazon",
  current_price: 5000, original_price: null, discount: null,
  rating: null, review_count: null, rank: null, product_url: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useChat Flipkart fallback", () => {
  it("does NOT fall back when the catalog returns results", async () => {
    mockApi.chat.mockResolvedValue({ reply: "Searching…", product_query: PQ });
    mockApi.searchProducts.mockResolvedValue({ results: [FAKE_LISTING] });

    const { result } = renderHook(() => useChat());
    await act(async () => { await result.current.sendMessage("find OnePlus 12"); });

    expect(mockApi.searchProductsFlipkart).not.toHaveBeenCalled();
    const texts = result.current.messages.map((m) => m.content);
    expect(texts).not.toContain(STRINGS.flipkartFallbackMessage);
  });

  it("falls back to Flipkart and posts a message when the catalog is empty", async () => {
    mockApi.chat.mockResolvedValue({ reply: "Searching…", product_query: PQ });
    mockApi.searchProducts.mockResolvedValue({ results: [] });
    mockApi.searchProductsFlipkart.mockResolvedValue({
      results: [{ ...FAKE_LISTING, source: "Flipkart", buy_suggestion: "new" }],
    });

    const { result } = renderHook(() => useChat());
    await act(async () => { await result.current.sendMessage("find OnePlus 12"); });

    expect(mockApi.searchProductsFlipkart).toHaveBeenCalledWith(PQ);
    const texts = result.current.messages.map((m) => m.content);
    expect(texts).toContain(STRINGS.flipkartFallbackMessage);
    expect(result.current.productSearch.searchedVia).toBe("flipkart");
  });

  it("does NOT fall back when the catalog search errors", async () => {
    mockApi.chat.mockResolvedValue({ reply: "Searching…", product_query: PQ });
    mockApi.searchProducts.mockRejectedValue(new Error("SF down"));

    const { result } = renderHook(() => useChat());
    await act(async () => { await result.current.sendMessage("find OnePlus 12"); });

    expect(mockApi.searchProductsFlipkart).not.toHaveBeenCalled();
  });
});
