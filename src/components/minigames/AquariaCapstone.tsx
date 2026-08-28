import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";

const FIXES = [
  { id: "filter", label: "Require the mill to cool and filter its own discharge", good: true },
  { id: "dilute", label: "Release more lake water to dilute the outflow", good: false },
  { id: "downstream", label: "Move the town's intake downstream of the mill", good: false },
];

export default function AquariaCapstone() {
  const [people, setPeople] = useState(40);
  const [nature, setNature] = useState(30);
  const [fix, setFix] = useState<string | null>(null);
  const [result, setResult] = useState<null | { win: boolean; reason: string }>(null);
  const { closeModal, awardCrystal, grantXp, awardBadge, progressQuest } = useGameStore();

  const resources = 100 - people - nature;

  function submit() {
    let win = false;
    let reason = "";
    if (resources < 20) reason = "Starve the mill and the town loses its work — people leave, and nobody stays to protect the lake.";
    else if (people < 25) reason = "The town can't drink. A lake that fails people gets drained by people.";
    else if (nature < 30) reason = "The wetland collapses below a third of the flow. Without it, nothing filters the water for free.";
    else if (fix !== "filter") reason = "You balanced the shares but left the mill's hot discharge untouched — the damage keeps arriving upstream of every share.";
    else {
      win = true;
      reason = "Town, wetland and mill all above their thresholds, and the pollution stopped at its source rather than being diluted downstream.";
    }
    setResult({ win, reason });
    if (win) {
      awardBadge("clean_current");
      progressQuest("water_watcher");
      awardCrystal("water");
    } else {
      grantXp(15);
    }
  }

  return (
    <div className="eq-modal-backdrop">
      <div className="eq-panel eq-panel-wide">
        <header>
          <h2>Crystal Lake</h2>
          <span>Aquaria capstone · Water Crystal</span>
        </header>
        <p className="eq-prompt">
          Allocate the lake's flow between people, nature and resources — then decide what to do about the mill.
        </p>

        <div className="eq-sliders">
          <label>
            People (town supply): <strong>{people}%</strong>
            <input
              type="range"
              min={0}
              max={100}
              value={people}
              disabled={!!result}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPeople(Math.min(v, 100 - nature));
              }}
            />
          </label>
          <label>
            Nature (wetland): <strong>{nature}%</strong>
            <input
              type="range"
              min={0}
              max={100}
              value={nature}
              disabled={!!result}
              onChange={(e) => {
                const v = Number(e.target.value);
                setNature(Math.min(v, 100 - people));
              }}
            />
          </label>
          <div className="eq-remainder">
            Resources (mill &amp; farms): <strong>{resources}%</strong>
          </div>
        </div>

        <div className="eq-options">
          {FIXES.map((f) => (
            <button
              key={f.id}
              type="button"
              disabled={!!result}
              className={`eq-option ${fix === f.id ? "is-selected" : ""}`}
              onClick={() => setFix(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {result && (
          <div className={`eq-feedback ${result.win ? "is-right" : "is-wrong"}`}>
            <strong>{result.win ? "The Water Crystal awakens." : "The lake stays clouded."}</strong>
            <p>{result.reason}</p>
          </div>
        )}

        <div className="eq-dialogue-actions">
          {!result ? (
            <button type="button" className="eq-primary" disabled={!fix} onClick={submit}>
              Set the allocation
            </button>
          ) : (
            <>
              {!result.win && (
                <button type="button" className="eq-ghost" onClick={() => setResult(null)}>
                  Adjust
                </button>
              )}
              <button type="button" className="eq-primary" onClick={closeModal}>
                Leave the lake
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
