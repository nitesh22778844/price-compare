import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PriceTrend } from "../../src/components/results/PriceTrend";

describe("PriceTrend", () => {
  it("renders a dash when last paid is null", () => {
    render(<PriceTrend current={62000} lastPaid={null} />);
    expect(screen.getByLabelText(/no price change/i)).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders a dash when current is null", () => {
    render(<PriceTrend current={null} lastPaid={62000} />);
    expect(screen.getByLabelText(/no price change/i)).toBeInTheDocument();
  });

  it("renders a dash when prices are equal", () => {
    render(<PriceTrend current={62000} lastPaid={62000} />);
    expect(screen.getByLabelText(/no price change/i)).toBeInTheDocument();
  });

  it("renders an up trend with the delta when current is higher", () => {
    render(<PriceTrend current={62000} lastPaid={59000} />);
    const el = screen.getByLabelText(/up .* versus last paid/i);
    expect(el).toBeInTheDocument();
    // ₹3,000 difference shown
    expect(el).toHaveTextContent("3,000");
  });

  it("renders a down trend with the delta when current is lower", () => {
    render(<PriceTrend current={59000} lastPaid={62000} />);
    const el = screen.getByLabelText(/down .* versus last paid/i);
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("3,000");
  });
});
