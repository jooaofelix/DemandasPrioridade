import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DurationPicker } from "./DurationPicker";

describe("DurationPicker", () => {
  it("starts with 25 minutes selected by default", async () => {
    const onStart = vi.fn();
    render(<DurationPicker taskTitle="Estudar" firstStep={null} onStart={onStart} />);
    await userEvent.click(screen.getByRole("button", { name: "Começar" }));
    expect(onStart).toHaveBeenCalledWith(25);
  });

  it("starts with the chosen preset duration", async () => {
    const onStart = vi.fn();
    render(<DurationPicker taskTitle="Estudar" firstStep={null} onStart={onStart} />);
    await userEvent.click(screen.getByRole("button", { name: "2 min" }));
    await userEvent.click(screen.getByRole("button", { name: "Começar" }));
    expect(onStart).toHaveBeenCalledWith(2);
  });

  it("disables the start button until a valid custom duration is entered", async () => {
    render(<DurationPicker taskTitle="Estudar" firstStep={null} onStart={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Personalizado" }));
    expect(screen.getByRole("button", { name: "Começar" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Minutos"), "12");
    expect(screen.getByRole("button", { name: "Começar" })).not.toBeDisabled();
  });
});
