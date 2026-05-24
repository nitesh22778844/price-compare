import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SuggestionBadge } from "../../src/components/results/SuggestionBadge";

describe("SuggestionBadge", () => {
  it("renders the Frequent buy label", () => {
    render(<SuggestionBadge label="frequent" reason="Bought 4x, last 12 days ago" />);
    expect(screen.getByText(/frequent buy/i)).toBeInTheDocument();
  });

  it("renders the Time to restock label", () => {
    render(<SuggestionBadge label="restock" reason="Bought 1x, last 40 days ago" />);
    expect(screen.getByText(/time to restock/i)).toBeInTheDocument();
  });

  it("renders the Recently bought label", () => {
    render(<SuggestionBadge label="recent" reason="Bought 1x, last 5 days ago" />);
    expect(screen.getByText(/recently bought/i)).toBeInTheDocument();
  });

  it("renders the New to you label", () => {
    render(<SuggestionBadge label="new" reason="Never ordered before" />);
    expect(screen.getByText(/new to you/i)).toBeInTheDocument();
  });

  it("sets the reason as the title attribute", () => {
    render(<SuggestionBadge label="restock" reason="Bought 2x, last 35 days ago" />);
    const badge = screen.getByText(/time to restock/i).closest("span");
    expect(badge).toHaveAttribute("title", "Bought 2x, last 35 days ago");
  });

  it("renders nothing when label is null", () => {
    const { container } = render(<SuggestionBadge label={null} reason={null} />);
    expect(container.firstChild).toBeNull();
  });
});
