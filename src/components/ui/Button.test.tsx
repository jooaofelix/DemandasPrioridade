import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label and responds to clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Começar agora</Button>);
    const button = screen.getByRole("button", { name: "Começar agora" });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Indisponível
      </Button>
    );
    await userEvent.click(screen.getByRole("button", { name: "Indisponível" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
