import { useState } from "react";
import { createRoot } from "react-dom/client";
import { RoundView } from "./src/components/RoundView";
import { Summary } from "./src/components/Summary";
import type { ClueId } from "./src/data/clues";
import type { Country } from "./src/data/countries";
import { COUNTRIES } from "./src/data/countries";
import { GUESS_NAMES } from "./src/data/guessNames";
import type { Game, Round } from "./src/game/engine";
import {
  advance,
  buyClue,
  closeRound,
  pickCountries,
  ROUNDS,
  startGame,
  submitGuess,
} from "./src/game/engine";

export type AppProps = {
  pool?: readonly Country[];
  rand?: () => number;
};

/** A round that just closed books its score once, on the way out of "open". */
function replaceRound(game: Game, next: Round): Game {
  const current = game.rounds[game.index];
  if (current && current.status === "open" && next.status !== "open") {
    return closeRound(game, next);
  }
  return {
    ...game,
    rounds: game.rounds.map((round, i) => (i === game.index ? next : round)),
  };
}

export function App({ pool = COUNTRIES, rand = Math.random }: AppProps = {}) {
  const [game, setGame] = useState<Game>(() =>
    startGame(pickCountries(pool, ROUNDS, rand)),
  );

  const round = game.rounds[game.index];

  function handleBuy(id: ClueId) {
    setGame((current) => {
      const active = current.rounds[current.index];
      return active ? replaceRound(current, buyClue(active, id)) : current;
    });
  }

  function handleGuess(name: string) {
    setGame((current) => {
      const active = current.rounds[current.index];
      return active
        ? replaceRound(current, submitGuess(active, name))
        : current;
    });
  }

  function handleNext() {
    setGame(advance);
  }

  function handleRestart() {
    setGame(startGame(pickCountries(pool, ROUNDS, rand)));
  }

  return (
    <main className="app">
      <header className="app-head">
        <h1 className="app-title">
          <span aria-hidden="true">🦊</span> Fernweh
        </h1>
        <p className="app-sub">
          Ein Land, zehn Hinweise, ein Konto. Jeder Hinweis kostet Punkte, die
          du behalten willst.
        </p>
        <p className="app-score" data-testid="total">
          {game.total} Punkte
        </p>
      </header>

      {game.done || !round ? (
        <Summary
          rounds={game.rounds}
          total={game.total}
          onRestart={handleRestart}
        />
      ) : (
        <RoundView
          round={round}
          roundNumber={game.index + 1}
          totalRounds={game.rounds.length}
          guessOptions={GUESS_NAMES}
          onBuy={handleBuy}
          onGuess={handleGuess}
          onNext={handleNext}
          lastRound={game.index === game.rounds.length - 1}
        />
      )}
    </main>
  );
}

const el = document.getElementById("root");
if (el) {
  const root = createRoot(el);
  root.render(<App />);
}
