import { describe, expect, test } from "bun:test";
import type { Country } from "../src/data/countries";
import { COUNTRIES } from "../src/data/countries";
import {
  advance,
  budgetShare,
  buyClue,
  canBuy,
  closeRound,
  flagEmoji,
  isCorrect,
  newRound,
  normalizeGuess,
  pickCountries,
  ROUND_BUDGET,
  ROUNDS,
  shuffle,
  startGame,
  submitGuess,
  WRONG_PENALTY,
} from "../src/game/engine";

const germany = COUNTRIES.find((country) => country.id === "de") as Country;
const france = COUNTRIES.find((country) => country.id === "fr") as Country;

describe("guessing", () => {
  test("normalizes case, umlauts and punctuation", () => {
    expect(normalizeGuess("  ÖSTERREICH! ")).toBe("osterreich");
    expect(normalizeGuess("Osterreich")).toBe("osterreich");
    expect(normalizeGuess("Türkei")).toBe("turkei");
    expect(normalizeGuess("Weißrussland")).toBe("weissrussland");
  });

  test("accepts the German name and the English alias", () => {
    expect(isCorrect(germany, "Deutschland")).toBe(true);
    expect(isCorrect(germany, "germany")).toBe(true);
    expect(isCorrect(germany, "  deutschland  ")).toBe(true);
  });

  test("rejects another country and an empty guess", () => {
    expect(isCorrect(germany, "Frankreich")).toBe(false);
    expect(isCorrect(germany, "   ")).toBe(false);
  });
});

describe("buying clues", () => {
  test("a purchase deducts its price and records the clue", () => {
    const round = buyClue(newRound(germany), "postcard");
    expect(round.budget).toBe(ROUND_BUDGET - 260);
    expect(round.bought).toEqual(["postcard"]);
  });

  test("the same clue cannot be bought twice", () => {
    const once = buyClue(newRound(germany), "plug");
    const twice = buyClue(once, "plug");
    expect(twice).toBe(once);
  });

  test("a clue beyond the budget stays unbuyable", () => {
    const round = { ...newRound(germany), budget: 50 };
    expect(canBuy(round, "postcard")).toBe(false);
    expect(buyClue(round, "postcard").budget).toBe(50);
  });

  test("nothing can be bought after the round closed", () => {
    const solved = submitGuess(newRound(germany), "Deutschland");
    expect(canBuy(solved, "plug")).toBe(false);
  });

  test("the budget bar never leaves 0..1", () => {
    expect(budgetShare(newRound(germany))).toBe(1);
    expect(budgetShare({ ...newRound(germany), budget: -10 })).toBe(0);
  });
});

describe("guessing in a round", () => {
  test("a correct guess banks the remaining budget", () => {
    const round = submitGuess(
      buyClue(newRound(germany), "flag"),
      "Deutschland",
    );
    expect(round.status).toBe("solved");
    expect(round.score).toBe(ROUND_BUDGET - 110);
  });

  test("a wrong guess costs the penalty and is remembered", () => {
    const round = submitGuess(newRound(germany), "Frankreich");
    expect(round.status).toBe("open");
    expect(round.budget).toBe(ROUND_BUDGET - WRONG_PENALTY);
    expect(round.wrongGuesses).toEqual(["Frankreich"]);
  });

  test("the fourth wrong guess empties the account and ends the round", () => {
    let round = newRound(germany);
    for (const guess of ["Frankreich", "Polen", "Italien", "Spanien"]) {
      round = submitGuess(round, guess);
    }
    expect(round.status).toBe("broke");
    expect(round.budget).toBe(0);
    expect(round.score).toBe(0);
    expect(round.wrongGuesses).toHaveLength(4);
  });

  test("three wrong guesses still leave 250 points to play with", () => {
    let round = newRound(germany);
    for (const guess of ["Frankreich", "Polen", "Italien"]) {
      round = submitGuess(round, guess);
    }
    expect(round.status).toBe("open");
    expect(round.budget).toBe(250);
  });

  test("an empty guess changes nothing", () => {
    const round = newRound(germany);
    expect(submitGuess(round, "  ")).toBe(round);
  });

  test("a closed round ignores further guesses", () => {
    const solved = submitGuess(newRound(germany), "Deutschland");
    expect(submitGuess(solved, "Frankreich")).toBe(solved);
  });
});

describe("game flow", () => {
  test("a game keeps at most ROUNDS rounds", () => {
    const game = startGame(COUNTRIES);
    expect(game.rounds).toHaveLength(ROUNDS);
    expect(game.done).toBe(false);
    expect(game.total).toBe(0);
  });

  test("a small pool yields a short game", () => {
    expect(startGame([germany, france]).rounds).toHaveLength(2);
  });

  test("closing a round books its score once", () => {
    const game = startGame([germany]);
    const solved = submitGuess(
      game.rounds[0] as (typeof game.rounds)[number],
      "Deutschland",
    );
    const closed = closeRound(game, solved);
    expect(closed.total).toBe(ROUND_BUDGET);
    expect(closed.rounds[0]?.status).toBe("solved");
  });

  test("advancing past the last round ends the game", () => {
    const game = advance(startGame([germany]));
    expect(game.done).toBe(true);
  });
});

describe("shuffle", () => {
  test("is deterministic for a fixed random source", () => {
    const rand = () => 0.5;
    expect(shuffle([1, 2, 3, 4, 5], rand)).toEqual(
      shuffle([1, 2, 3, 4, 5], rand),
    );
  });

  test("keeps every element", () => {
    const shuffled = shuffle(COUNTRIES, () => 0.42);
    expect(shuffled).toHaveLength(COUNTRIES.length);
    expect(new Set(shuffled.map((c) => c.id)).size).toBe(COUNTRIES.length);
  });

  test("picks distinct countries and caps at the pool size", () => {
    const picked = pickCountries(COUNTRIES, ROUNDS, () => 0.1);
    expect(picked).toHaveLength(ROUNDS);
    expect(new Set(picked.map((c) => c.id)).size).toBe(ROUNDS);
    expect(pickCountries([germany], ROUNDS, () => 0.1)).toHaveLength(1);
  });
});

describe("flag emoji", () => {
  test("builds a regional indicator pair", () => {
    expect(flagEmoji("DE")).toBe("🇩🇪");
    expect(flagEmoji("br")).toBe("🇧🇷");
  });

  test("falls back to a white flag on nonsense", () => {
    expect(flagEmoji("X")).toBe("🏳️");
    expect(flagEmoji("12")).toBe("🏳️");
  });
});
