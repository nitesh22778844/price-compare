import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComparisonTable } from "../../src/components/results/ComparisonTable";
import type { ProductListing } from "../../src/lib/types";

function makeListing(overrides: Partial<ProductListing> = {}): ProductListing {
  return {
    id: "1",
    title: "OnePlus 12 5G",
    source: "Amazon",
    current_price: 62000,
    original_price: 70000,
    discount: 11,
    rating: "4.5",
    review_count: 5000,
    rank: 1,
    product_url: "https://amazon.in/dp/x",
    image_url: null,
    last_ordered_date: null,
    times_purchased: null,
    buy_suggestion: null,
    suggestion_reason: null,
    ...overrides,
  };
}

describe("ComparisonTable", () => {
  it("shows empty state when no results", () => {
    render(<ComparisonTable results={[]} loading={false} error={null} />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it("shows loading skeletons when loading", () => {
    render(<ComparisonTable results={[]} loading={true} error={null} />);
    expect(screen.getByLabelText(/loading product results/i)).toBeInTheDocument();
  });

  it("shows error message when error provided", () => {
    render(<ComparisonTable results={[]} loading={false} error="Network error" />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("renders product title", () => {
    render(<ComparisonTable results={[makeListing()]} loading={false} error={null} />);
    expect(screen.getByText("OnePlus 12 5G")).toBeInTheDocument();
  });

  it("renders source group header", () => {
    render(<ComparisonTable results={[makeListing()]} loading={false} error={null} />);
    // Source name and result count are in separate spans for distinct styling
    expect(screen.getAllByText(/Amazon/).length).toBeGreaterThan(0);
    expect(screen.getByText(/— 1 result/)).toBeInTheDocument();
  });

  it("renders 'Top match' badge on first row of each group", () => {
    const results = [
      makeListing({ id: "1", source: "Amazon" }),
      makeListing({ id: "2", source: "Amazon", title: "OnePlus 12 512GB" }),
    ];
    render(<ComparisonTable results={results} loading={false} error={null} />);
    const badges = screen.getAllByText(/top match/i);
    expect(badges).toHaveLength(1);
  });

  it("renders green discount pill", () => {
    render(<ComparisonTable results={[makeListing({ discount: 15 })]} loading={false} error={null} />);
    expect(screen.getByText("-15%")).toBeInTheDocument();
  });

  it("renders strikethrough original price when higher", () => {
    const { container } = render(
      <ComparisonTable results={[makeListing()]} loading={false} error={null} />
    );
    const strikethrough = container.querySelector(".line-through");
    expect(strikethrough).not.toBeNull();
  });

  it("renders View link with correct href", () => {
    render(<ComparisonTable results={[makeListing()]} loading={false} error={null} />);
    const link = screen.getByRole("link", { name: /view/i });
    expect(link).toHaveAttribute("href", "https://amazon.in/dp/x");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("groups multiple sources with separate headers", () => {
    const results = [
      makeListing({ id: "1", source: "Amazon" }),
      makeListing({ id: "2", source: "Flipkart" }),
    ];
    render(<ComparisonTable results={results} loading={false} error={null} />);
    expect(screen.getAllByText(/Amazon/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Flipkart/).length).toBeGreaterThan(0);
  });

  it("renders the Buy? column header", () => {
    render(<ComparisonTable results={[makeListing()]} loading={false} error={null} />);
    expect(screen.getByText("Buy?")).toBeInTheDocument();
  });

  it("renders a SuggestionBadge when buy_suggestion is set", () => {
    render(
      <ComparisonTable
        results={[
          makeListing({
            buy_suggestion: "frequent",
            suggestion_reason: "Bought 4x, last 12 days ago",
          }),
        ]}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByText(/frequent buy/i)).toBeInTheDocument();
  });
});
