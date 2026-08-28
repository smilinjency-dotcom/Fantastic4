import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";

const LINKS = [
  { eater: "Barn owl", answer: "Field mouse", options: ["Field mouse", "Oak acorn", "Sunlight"] },
  { eater: "Field mouse", answer: "Oak acorn", options: ["Barn owl", "Oak acorn", "Fungi"] },
  { eater: "Oak tree", answer: "Sunlight", options: ["Sunlight", "Beetle", "Field mouse"] },
  { eater: "Fungi", answer: "Fallen deadwood", options: ["Fallen deadwood", "Sunlight", "Barn owl"] },
];

export default function FoodWebMinigame() {
  const [answers, setAnswers] = useState<(string | null)[]>(LINKS.map(() => null));
  const [checked, setChecked] = useState(false);
  const { closeModal, completeLesson, grantXp, awardBadge } = useGameStore();

  const allPicked = answers.every(Boolean);
  const correctCount = answers.filter((a, i) => a === LINKS[i]!.answer).length;
  const perfect = correctCount === LINKS.length;

  function check() {
    setChecked(true);
    if (correctCount === LINKS.length) {
      const fresh = completeLesson("food_web", 45);
      if (!fresh) grantXp(5);
      awardBadge("web_weaver");
    } else {
      grantXp(correctCount * 5);
    }
  }

  return (
    <div className="eq-modal-backdrop">
      <div className="eq-panel">
        <header>
          <h2>Rebuild the food web</h2>
          <span>Dr. Nyla · Forestia pond</span>
        </header>
        <p className="eq-prompt">
          Pick what each link feeds on. Get all four and the web closes — miss one and you'll see where energy leaks
          out.
        </p>
        <div className="eq-web">
          {LINKS.map((link, i) => (
            <div className="eq-web-row" key={link.eater}>
              <span className="eq-web-eater">{link.eater} eats…</span>
              <div className="eq-web-options">
                {link.options.map((opt) => {
                  const selected = answers[i] === opt;
                  const state = checked && selected ? (opt === link.answer ? "is-right" : "is-wrong") : "";
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={checked}
                      className={`eq-chip ${selected ? "is-selected" : ""} ${state}`}
                      onClick={() =>
                        setAnswers((prev) => prev.map((value, index) => (index === i ? opt : value)))
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {checked && (
          <div className={`eq-feedback ${perfect ? "is-right" : "is-wrong"}`}>
            <strong>{correctCount} / {LINKS.length} links restored.</strong>
            <p>
              {perfect
                ? "Deadwood was the missing link — clear it away and the fungi starve, the soil thins, and the oaks follow."
                : "Energy always flows from sunlight upward. Follow it one step at a time and try the web again."}
            </p>
          </div>
        )}
        <div className="eq-dialogue-actions">
          {!checked ? (
            <button type="button" className="eq-primary" disabled={!allPicked} onClick={check}>
              Close the web
            </button>
          ) : (
            <>
              {!perfect && (
                <button
                  type="button"
                  className="eq-ghost"
                  onClick={() => {
                    setChecked(false);
                    setAnswers(LINKS.map(() => null));
                  }}
                >
                  Try again
                </button>
              )}
              <button type="button" className="eq-primary" onClick={closeModal}>
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
