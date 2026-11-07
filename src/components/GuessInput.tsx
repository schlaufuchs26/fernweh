import { useMemo, useState } from "react";

type Props = {
  options: readonly string[];
  onGuess: (name: string) => void;
  disabled?: boolean;
};

function matchesQuery(option: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  const haystack = option.toLowerCase();
  return haystack.startsWith(needle) || haystack.includes(needle);
}

/**
 * Type-ahead over the world's countries. Enter takes the first suggestion
 * rather than the raw text: a typo should not cost 250 points, and a guess
 * has to be a real country name for the round to be judged fairly.
 */
export function GuessInput({ options, onGuess, disabled = false }: Props) {
  const [query, setQuery] = useState("");

  const suggestions = useMemo(
    () => options.filter((option) => matchesQuery(option, query)).slice(0, 6),
    [options, query],
  );

  function submit(name: string) {
    onGuess(name);
    setQuery("");
  }

  return (
    <div className="guess">
      <div className="guess-row">
        <input
          type="text"
          className="guess-input"
          placeholder="Land raten …"
          aria-label="Land raten"
          value={query}
          disabled={disabled}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            const first = suggestions[0];
            if (first) submit(first);
          }}
        />
      </div>
      {suggestions.length > 0 && !disabled && (
        <ul className="suggestions" aria-label="Vorschläge">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="suggestion"
                onClick={() => submit(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
