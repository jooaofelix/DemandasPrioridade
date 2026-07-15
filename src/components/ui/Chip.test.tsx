import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("exposes selection state via aria-pressed", () => {
    render(<Chip selected>Energia baixa</Chip>);
    expect(screen.getByRole("button", { name: "Energia baixa" })).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onClick when tapped", async () => {
    const onClick = vi.fn();
    render(
      <Chip selected={false} onClick={onClick}>
        Energia alta
      </Chip>
    );
    await userEvent.click(screen.getByRole("button", { name: "Energia alta" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
