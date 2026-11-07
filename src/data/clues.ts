/**
 * The ten clue types a player can buy. The prices are the game's whole
 * economy: the postcard (a greeting in the local language and script) is
 * almost decisive for a lone country but only narrows a language cluster,
 * so it costs the most. Cheap clues (driving side, plug type) rarely decide
 * a round on their own.
 */
export const CLUE_IDS = [
  "postcard",
  "currency",
  "flag",
  "dish",
  "neighbours",
  "area",
  "population",
  "export",
  "drive",
  "plug",
] as const;

export type ClueId = (typeof CLUE_IDS)[number];

export type ClueDefinition = {
  id: ClueId;
  label: string;
  price: number;
  /** Shown on the card after the purchase; keeps the cards scannable. */
  icon: string;
};

export const CLUES: readonly ClueDefinition[] = [
  { id: "postcard", label: "Postkarte", price: 260, icon: "✉️" },
  { id: "currency", label: "Währung", price: 140, icon: "🪙" },
  { id: "flag", label: "Flagge", price: 110, icon: "🚩" },
  { id: "dish", label: "Nationalgericht", price: 140, icon: "🍲" },
  { id: "neighbours", label: "Nachbarländer", price: 90, icon: "🧭" },
  { id: "area", label: "Fläche", price: 90, icon: "📐" },
  { id: "population", label: "Einwohner", price: 80, icon: "👥" },
  { id: "export", label: "Export", price: 120, icon: "📦" },
  { id: "drive", label: "Verkehr", price: 60, icon: "🚗" },
  { id: "plug", label: "Steckdose", price: 60, icon: "🔌" },
];

export const CLUE_BY_ID: Record<ClueId, ClueDefinition> = Object.fromEntries(
  CLUES.map((clue) => [clue.id, clue]),
) as Record<ClueId, ClueDefinition>;

/** Buying every clue costs more than a round's budget, so a round is a choice. */
export const TOTAL_CLUE_PRICE = CLUES.reduce(
  (sum, clue) => sum + clue.price,
  0,
);
