import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { CartProvider } from "../../src/hooks/useCart";
import { AddToCartButton } from "../../src/components/cart/AddToCartButton";

const renderWithCart = (ui: ReactNode) => render(<CartProvider>{ui}</CartProvider>);

describe("AddToCartButton", () => {
  it("renders Add when not in the cart", () => {
    renderWithCart(<AddToCartButton name="Amul Gold Milk" source="Flipkart" />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent(/add/i);
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles to Added on click", () => {
    renderWithCart(<AddToCartButton name="Amul Gold Milk" source="Flipkart" />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(btn).toHaveTextContent(/added/i);
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("removes from cart on second click", () => {
    renderWithCart(<AddToCartButton name="Amul Gold Milk" source="Flipkart" />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn).toHaveTextContent(/add/i);
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });
});
