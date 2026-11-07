import type { ClueId } from "../data/clues";
import { CLUE_BY_ID } from "../data/clues";
import type { Country } from "../data/countries";

export const ROUNDS = 8;
export const ROUND_BUDGET = 1000;
/** A wrong guess costs budget instead of ending the round; three of them hurt. */
export const WRONG_PENALTY = 250;

type RoundStatus = "open" | "solved" | "broke";

export type Round = {
  /** Position in the game; a stable React key and nothing else. */
  slot: number;
  country: Country;
  budget: number;
  bought: ClueId[];
  wrongGuesses: string[];
  status: RoundStatus;
  /** Points banked for this round; only set once the round is closed. */
  score: number;
};

export type Game = {
  rounds: Round[];
  index: number;
  total: number;
  done: boolean;
};

/**
 * Folds a typed country name to a comparable key: ß becomes ss, umlauts and
 * accents lose their mark (ö → o), so "Österreich" and a keyboard without
 * umlauts both land on the same string.
 */
export function normalizeGuess(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isCorrect(country: Country, guess: string): boolean {
  const wanted = normalizeGuess(guess);
  if (!wanted) return false;
  const accepted = [country.name, ...country.aliases].map(normalizeGuess);
  return accepted.includes(wanted);
}

export function newRound(country: Country, slot = 0): Round {
  return {
    slot,
    country,
    budget: ROUND_BUDGET,
    bought: [],
    wrongGuesses: [],
    status: "open",
    score: 0,
  };
}

export function canBuy(round: Round, id: ClueId): boolean {
  return (
    round.status === "open" &&
    !round.bought.includes(id) &&
    round.budget >= CLUE_BY_ID[id].price
  );
}

export function buyClue(round: Round, id: ClueId): Round {
  if (!canBuy(round, id)) return round;
  return {
    ...round,
    budget: round.budget - CLUE_BY_ID[id].price,
    bought: [...round.bought, id],
  };
}

export function submitGuess(round: Round, guess: string): Round {
  if (round.status !== "open") return round;
  const cleaned = guess.trim();
  if (!cleaned) return round;

  if (isCorrect(round.country, cleaned)) {
    return { ...round, status: "solved", score: round.budget };
  }

  const budget = round.budget - WRONG_PENALTY;
  const wrongGuesses = [...round.wrongGuesses, cleaned];
  if (budget <= 0) {
    return { ...round, budget: 0, wrongGuesses, status: "broke", score: 0 };
  }
  return { ...round, budget, wrongGuesses };
}

export function startGame(countries: readonly Country[]): Game {
  const rounds = countries
    .slice(0, ROUNDS)
    .map((country, i) => newRound(country, i));
  return { rounds, index: 0, total: 0, done: rounds.length === 0 };
}

/** Applies a finished round's score to the running total. */
export function closeRound(game: Game, round: Round): Game {
  const rounds = game.rounds.map((entry, i) =>
    i === game.index ? round : entry,
  );
  return { ...game, rounds, total: game.total + round.score };
}

export function advance(game: Game): Game {
  const index = game.index + 1;
  if (index >= game.rounds.length) return { ...game, done: true };
  return { ...game, index };
}

/** Fisher-Yates; `rand` is injectable so tests get a fixed order. */
export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = copy[i] as T;
    const b = copy[j] as T;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

export function pickCountries(
  pool: readonly Country[],
  count: number,
  rand: () => number,
): Country[] {
  return shuffle(pool, rand).slice(0, Math.min(count, pool.length));
}

export function flagEmoji(iso2: string): string {
  const letters = iso2.toUpperCase().split("");
  if (letters.length !== 2) return "🏳️";
  const points = letters.map((letter) => letter.charCodeAt(0) - 65);
  if (points.some((point) => point < 0 || point > 25)) return "🏳️";
  return points.map((point) => String.fromCodePoint(0x1f1e6 + point)).join("");
}

export function budgetShare(round: Round): number {
  return Math.max(0, Math.min(1, round.budget / ROUND_BUDGET));
}
