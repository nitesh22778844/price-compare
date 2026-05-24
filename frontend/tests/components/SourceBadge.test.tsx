import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SourceBadge } from "../../src/components/results/SourceBadge";
import { getSourceTheme } from "../../src/lib/source-theme";

describe("SourceBadge", () => {
  it("renders the Amazon logo for source 'Amazon'", () => {
    const { container } = render(<SourceBadge source="Amazon" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByLabelText("Source: Amazon")).toBeInTheDocument();
  });

  it("renders the Amazon logo for lowercase source 'amazon'", () => {
    const { container } = render(<SourceBadge source="amazon" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByLabelText("Source: Amazon")).toBeInTheDocument();
  });

  it("renders the Flipkart logo for source 'Flipkart'", () => {
    const { container } = render(<SourceBadge source="Flipkart" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByLabelText("Source: Flipkart")).toBeInTheDocument();
  });

  it("renders the Flipkart logo for lowercase source 'flipkart'", () => {
    const { container } = render(<SourceBadge source="flipkart" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByLabelText("Source: Flipkart")).toBeInTheDocument();
  });

  it("renders Reliance Digital as the RD text pill (no logo)", () => {
    render(<SourceBadge source="Reliance Digital" />);
    expect(screen.getByText("RD")).toBeInTheDocument();
  });

  it("renders Croma as a text pill (no logo)", () => {
    render(<SourceBadge source="Croma" />);
    expect(screen.getByText("Croma")).toBeInTheDocument();
  });

  it("renders unknown source with its name as a fallback pill", () => {
    render(<SourceBadge source="Unknown Store" />);
    expect(screen.getByText("Unknown Store")).toBeInTheDocument();
  });

  it("applies the accent color to the non-logo fallback pill", () => {
    const { container } = render(<SourceBadge source="Croma" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.backgroundColor).toBeTruthy();
  });
});

describe("source-theme contract", () => {
  it("Amazon has orange accent", () => {
    expect(getSourceTheme("Amazon").accent).toBe("#FF9900");
  });

  it("Flipkart has blue accent", () => {
    expect(getSourceTheme("Flipkart").accent).toBe("#2874F0");
  });

  it("Croma has green accent", () => {
    expect(getSourceTheme("Croma").accent).toBe("#27C14D");
  });

  it("Reliance Digital has red accent", () => {
    expect(getSourceTheme("Reliance Digital").accent).toBe("#C8102E");
  });

  it("lowercase source still resolves to canonical theme", () => {
    expect(getSourceTheme("amazon").label).toBe("Amazon");
    expect(getSourceTheme("flipkart").label).toBe("Flipkart");
  });

  it("unknown source gets gray accent", () => {
    expect(getSourceTheme("SomeNewStore").accent).toBe("#6B7280");
  });
});
