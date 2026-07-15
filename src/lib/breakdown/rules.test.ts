import { describe, expect, it } from "vitest";
import { buildStepsFromAnswers, suggestStepsFromTitle } from "./rules";

describe("suggestStepsFromTitle", () => {
  it("matches a known vague task and returns concrete steps", () => {
    const steps = suggestStepsFromTitle("Fazer trabalho da faculdade");
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0].toLowerCase()).toContain("abrir");
  });

  it("is accent-insensitive", () => {
    const withAccent = suggestStepsFromTitle("Preciso estudar para a prova");
    const withoutAccent = suggestStepsFromTitle("preciso estudar para a prova");
    expect(withAccent).toEqual(withoutAccent);
  });

  it("falls back to a generic breakdown for unknown tasks", () => {
    const steps = suggestStepsFromTitle("xyzabc nonsense task");
    expect(steps.length).toBeGreaterThan(0);
  });
});

describe("buildStepsFromAnswers", () => {
  it("omits empty answers", () => {
    const steps = buildStepsFromAnswers({ definitionOfDone: "", firstMove: "abrir o arquivo", precondition: "" });
    expect(steps).toEqual(["abrir o arquivo"]);
  });

  it("orders precondition, first move, then definition of done", () => {
    const steps = buildStepsFromAnswers({
      definitionOfDone: "relatório enviado",
      firstMove: "abrir o editor",
      precondition: "ter os dados da planilha"
    });
    expect(steps).toEqual(["ter os dados da planilha", "abrir o editor", "Conferir: relatório enviado"]);
  });
});
