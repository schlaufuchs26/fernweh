import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "../frontend";
import type { Country } from "../src/data/countries";
import { COUNTRIES } from "../src/data/countries";

const germany = COUNTRIES.find((country) => country.id === "de") as Country;

function renderOneRound() {
  render(<App pool={[germany]} rand={() => 0.5} />);
}

function guess(name: string) {
  fireEvent.change(screen.getByLabelText("Land raten"), {
    target: { value: name },
  });
  const option = screen
    .getAllByRole("button")
    .find((button) => button.textContent === name);
  if (!option) throw new Error(`no suggestion for ${name}`);
  fireEvent.click(option);
}

describe("Fernweh", () => {
  test("shows the title, the round counter and the free region", () => {
    renderOneRound();
    expect(
      screen.getByRole("heading", { name: /Fernweh/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Runde 1 / 1")).toBeInTheDocument();
    expect(screen.getByText("Europa")).toBeInTheDocument();
    expect(screen.getByTestId("total")).toHaveTextContent("0 Punkte");
  });

  test("offers every clue for sale", () => {
    renderOneRound();
    expect(screen.getAllByRole("button", { name: /Postkarte/ })).toHaveLength(
      1,
    );
    expect(screen.getAllByRole("button", { name: /Steckdose/ })).toHaveLength(
      1,
    );
  });

  test("buying a clue reveals its value and lowers the budget", () => {
    renderOneRound();
    fireEvent.click(screen.getByRole("button", { name: /Postkarte/ }));

    expect(
      screen.getByText("Hallo! Wie geht es dir? Bis bald, dein Freund."),
    ).toBeInTheDocument();
    expect(screen.getByText("740 von 1000 Punkten")).toBeInTheDocument();
    // The bought clue stays in the shop, greyed out, so the price is visible.
    expect(screen.getByRole("button", { name: /Postkarte/ })).toBeDisabled();
  });

  test("a wrong guess costs 250 and shows up struck through", () => {
    renderOneRound();
    guess("Frankreich");

    expect(screen.getByText("750 von 1000 Punkten")).toBeInTheDocument();
    const wrong = screen.getByLabelText("Falsche Tipps");
    expect(wrong).toHaveTextContent("Frankreich");
    expect(screen.queryByRole("heading", { name: "Deutschland" })).toBeNull();
  });

  test("the right guess reveals the country, the fact and the score", () => {
    renderOneRound();
    fireEvent.click(screen.getByRole("button", { name: /Flagge/ }));
    guess("Deutschland");

    expect(
      screen.getByRole("heading", { name: "Deutschland" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/890 Punkte übrig/)).toBeInTheDocument();
    expect(screen.getByText(germany.fact)).toBeInTheDocument();
    expect(screen.getByTestId("total")).toHaveTextContent("890 Punkte");
  });

  test("the reveal lists the clues the player did not buy", () => {
    renderOneRound();
    guess("Deutschland");
    expect(
      screen.getByText(/Was du nicht gekauft hast \(10\)/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Bacalhau/)).toBeNull();
  });

  test("the round ends after four wrong guesses and scores nothing", () => {
    renderOneRound();
    guess("Frankreich");
    guess("Polen");
    guess("Italien");
    guess("Spanien");

    expect(screen.getByText(/Konto leer/)).toBeInTheDocument();
    expect(screen.getByTestId("total")).toHaveTextContent("0 Punkte");
  });

  test("Enter takes the first suggestion", () => {
    renderOneRound();
    const input = screen.getByLabelText("Land raten");
    fireEvent.change(input, { target: { value: "Deut" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(
      screen.getByRole("heading", { name: "Deutschland" }),
    ).toBeInTheDocument();
  });

  test("an empty Enter press does nothing", () => {
    renderOneRound();
    fireEvent.keyDown(screen.getByLabelText("Land raten"), { key: "Enter" });
    expect(screen.getByText("1000 von 1000 Punkten")).toBeInTheDocument();
  });

  test("the summary marks a lost round and gives a verdict", () => {
    renderOneRound();
    for (const name of ["Frankreich", "Polen", "Italien", "Spanien"]) {
      guess(name);
    }
    fireEvent.click(screen.getByRole("button", { name: "Auswertung" }));
    expect(screen.getByText("Konto leer")).toBeInTheDocument();
    expect(screen.getByText(/Abenteuerlich/)).toBeInTheDocument();
  });

  test("the summary counts the rounds and offers a new trip", () => {
    renderOneRound();
    guess("Deutschland");
    fireEvent.click(screen.getByRole("button", { name: "Auswertung" }));

    expect(screen.getByText(/von 1000 Punkten/)).toBeInTheDocument();
    expect(screen.getByText("Deutschland")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Noch eine Reise" }));
    expect(screen.getByText("Runde 1 / 1")).toBeInTheDocument();
  });

  test("a two-round game moves on to the next country", () => {
    render(<App pool={[germany, germany]} rand={() => 0.2} />);
    expect(screen.getByText("Runde 1 / 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Steckdose/ }));
    guess("Deutschland");
    fireEvent.click(screen.getByRole("button", { name: "Nächstes Land" }));
    expect(screen.getByText("Runde 2 / 2")).toBeInTheDocument();
    expect(screen.getByText("1000 von 1000 Punkten")).toBeInTheDocument();
  });
});
