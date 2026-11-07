import type { ClueId } from "../data/clues";
import { CLUES, TOTAL_CLUE_PRICE } from "../data/clues";
import type { Round } from "../game/engine";
import { budgetShare, flagEmoji } from "../game/engine";
import { GuessInput } from "./GuessInput";

type Props = {
  round: Round;
  roundNumber: number;
  totalRounds: number;
  guessOptions: readonly string[];
  onBuy: (id: ClueId) => void;
  onGuess: (name: string) => void;
  onNext: () => void;
  lastRound: boolean;
};

function Reveal({
  round,
  onNext,
  lastRound,
}: Pick<Props, "round" | "onNext" | "lastRound">) {
  const solved = round.status === "solved";
  const unbought = CLUES.filter((clue) => !round.bought.includes(clue.id));

  return (
    <div className={solved ? "reveal reveal-solved" : "reveal reveal-broke"}>
      <div className="reveal-head">
        <span className="reveal-flag" aria-hidden="true">
          {flagEmoji(round.country.iso2)}
        </span>
        <div>
          <p className="reveal-kicker">
            {solved
              ? `Richtig! ${round.score} Punkte übrig`
              : "Konto leer, das Land bleibt verdeckt"}
          </p>
          <h2 className="reveal-name">{round.country.name}</h2>
        </div>
      </div>
      <p className="fact">{round.country.fact}</p>
      {unbought.length > 0 && (
        <details className="reveal-more">
          <summary>Was du nicht gekauft hast ({unbought.length})</summary>
          <ul className="reveal-clues">
            {unbought.map((clue) => (
              <li key={clue.id}>
                <strong>{clue.label}:</strong> {round.country.clues[clue.id]}
              </li>
            ))}
          </ul>
        </details>
      )}
      <button type="button" className="next" onClick={onNext}>
        {lastRound ? "Auswertung" : "Nächstes Land"}
      </button>
    </div>
  );
}

export function RoundView({
  round,
  roundNumber,
  totalRounds,
  guessOptions,
  onBuy,
  onGuess,
  onNext,
  lastRound,
}: Props) {
  const open = round.status === "open";
  const bought = CLUES.filter((clue) => round.bought.includes(clue.id));

  return (
    <section className="round">
      <div className="round-head">
        <span className="round-count">
          Runde {roundNumber} / {totalRounds}
        </span>
        <span className="budget-label">{round.budget} von 1000 Punkten</span>
      </div>
      <div className="budget" role="presentation">
        <div
          className="budget-fill"
          style={{ width: `${Math.round(budgetShare(round) * 100)}%` }}
        />
      </div>

      <p className="free-clue">
        Geschenkt: <strong>{round.country.region}</strong>
      </p>

      {bought.length > 0 && (
        <ul className="bought">
          {bought.map((clue) => (
            <li key={clue.id} className="clue-card">
              <span className="clue-label">
                {clue.icon} {clue.label}
              </span>
              <span className="clue-value">{round.country.clues[clue.id]}</span>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <>
          <section className="shop" aria-label="Hinweise kaufen">
            {CLUES.map((clue) => {
              const isBought = round.bought.includes(clue.id);
              const affordable = round.budget >= clue.price;
              return (
                <button
                  key={clue.id}
                  type="button"
                  className="shop-item"
                  disabled={isBought || !affordable}
                  onClick={() => onBuy(clue.id)}
                >
                  <span aria-hidden="true">{clue.icon}</span> {clue.label}
                  <span className="price">{clue.price}</span>
                </button>
              );
            })}
          </section>
          <p className="hint-line">
            Ein Hinweis zu viel kostet dich den Sieg: alle {CLUES.length}{" "}
            zusammen kosten {TOTAL_CLUE_PRICE}, dein Konto hat 1000. Ein
            falscher Tipp kostet 250.
          </p>
          <GuessInput
            options={guessOptions}
            onGuess={onGuess}
            disabled={!open}
          />
          {round.wrongGuesses.length > 0 && (
            <ul className="wrong" aria-label="Falsche Tipps">
              {round.wrongGuesses.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <Reveal round={round} onNext={onNext} lastRound={lastRound} />
      )}
    </section>
  );
}
