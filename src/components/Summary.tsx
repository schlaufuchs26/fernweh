import type { Round } from "../game/engine";
import { flagEmoji, ROUND_BUDGET } from "../game/engine";

type Props = {
  rounds: readonly Round[];
  total: number;
  onRestart: () => void;
};

function verdict(total: number, max: number): string {
  const share = total / max;
  if (share >= 0.75)
    return "Reiseleiterin. Du reist mit leichtem Gepäck und schwerem Wissen.";
  if (share >= 0.5) return "Gute Route. Die Hälfte der Hinweise war Ballast.";
  if (share >= 0.25)
    return "Solide Umwege. Das nächste Mal weniger kaufen, mehr raten.";
  return "Abenteuerlich. Aber du warst überall.";
}

export function Summary({ rounds, total, onRestart }: Props) {
  const max = rounds.length * ROUND_BUDGET;

  return (
    <section className="summary">
      <h2 className="summary-total">
        {total} <span className="summary-max">von {max} Punkten</span>
      </h2>
      <p className="summary-verdict">{verdict(total, max)}</p>
      <ul className="summary-list">
        {rounds.map((round) => (
          <li key={round.slot} className="summary-row">
            <span className="summary-flag" aria-hidden="true">
              {flagEmoji(round.country.iso2)}
            </span>
            <span className="summary-country">{round.country.name}</span>
            <span className="summary-points">
              {round.status === "solved"
                ? `${round.score} P`
                : round.status === "broke"
                  ? "Konto leer"
                  : "übersprungen"}
            </span>
            <span className="summary-clues">
              {round.bought.length} Hinweise
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className="next" onClick={onRestart}>
        Noch eine Reise
      </button>
    </section>
  );
}
