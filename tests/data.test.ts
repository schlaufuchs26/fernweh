import { describe, expect, test } from "bun:test";
import { CLUE_IDS, CLUES, TOTAL_CLUE_PRICE } from "../src/data/clues";
import { COUNTRIES } from "../src/data/countries";
import { GUESS_NAMES } from "../src/data/guessNames";
import { ROUND_BUDGET } from "../src/game/engine";

describe("clue catalogue", () => {
  test("lists ten clues with distinct ids and positive prices", () => {
    expect(CLUES).toHaveLength(CLUE_IDS.length);
    expect(new Set(CLUES.map((clue) => clue.id)).size).toBe(CLUES.length);
    for (const clue of CLUES) {
      expect(clue.price).toBeGreaterThan(0);
      expect(clue.label.length).toBeGreaterThan(2);
    }
  });

  test("all clues together cost more than one round's budget", () => {
    expect(TOTAL_CLUE_PRICE).toBeGreaterThan(ROUND_BUDGET);
  });
});

describe("country data", () => {
  test("the pool is big enough for a varied game", () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(24);
  });

  test("ids, names and ISO codes are unique and well formed", () => {
    expect(new Set(COUNTRIES.map((c) => c.id)).size).toBe(COUNTRIES.length);
    expect(new Set(COUNTRIES.map((c) => c.name)).size).toBe(COUNTRIES.length);
    for (const country of COUNTRIES) {
      expect(country.iso2).toMatch(/^[A-Z]{2}$/);
      expect(country.region.length).toBeGreaterThan(2);
      expect(country.fact.length).toBeGreaterThan(20);
    }
  });

  test("every country answers every clue", () => {
    for (const country of COUNTRIES) {
      for (const id of CLUE_IDS) {
        const value = country.clues[id];
        expect(value, `${country.name} / ${id}`).toBeTruthy();
        expect(value.trim().length).toBeGreaterThan(1);
      }
    }
  });

  test("a postcard is written in the local script, not in German", () => {
    const germanStarters = ["Hallo!", "Hallo "];
    const germanCards = COUNTRIES.filter((country) =>
      germanStarters.some((starter) =>
        country.clues.postcard.startsWith(starter),
      ),
    ).map((country) => country.name);
    // Only the two German-speaking countries plus South Africa's trilingual
    // card may open with "Hallo"; a third would mean a lazy postcard.
    expect(germanCards.sort()).toEqual(["Deutschland", "Südafrika"]);
  });

  test("the Spanish-speaking cluster is ambiguous by postcard alone", () => {
    const spanish = COUNTRIES.filter((country) =>
      country.clues.postcard.includes("¿"),
    );
    expect(spanish.length).toBeGreaterThanOrEqual(4);
  });
});

describe("guess list", () => {
  test("contains every answer and no duplicates", () => {
    expect(new Set(GUESS_NAMES).size).toBe(GUESS_NAMES.length);
    for (const country of COUNTRIES) {
      expect(GUESS_NAMES).toContain(country.name);
    }
  });

  test("is wider than the answer pool, so guessing stays honest", () => {
    expect(GUESS_NAMES.length).toBeGreaterThan(COUNTRIES.length + 40);
  });
});
