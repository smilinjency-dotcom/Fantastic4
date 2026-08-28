import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";

interface Action {
  id: string;
  label: string;
  cost: number;
  good: boolean;
  note: string;
}

const ACTIONS: Action[] = [
  {
    id: "mixed",
    label: "Replant a mix of native species, not one fast-growing crop",
    cost: 2,
    good: true,
    note: "Mixed natives rebuild habitat layers instead of a timber field.",
  },
  {
    id: "deadwood",
    label: "Leave fallen deadwood where it lies",
    cost: 1,
    good: true,
    note: "Deadwood feeds the fungi and insects the whole web runs on.",
  },
  {
    id: "collection",
    label: "Set up a village waste collection so the dump stops growing",
    cost: 2,
    good: true,
    note: "Stops the source instead of endlessly clearing the symptom.",
  },
  {
    id: "import",
    label: "Truck in topsoil stripped from a farm two valleys over",
    cost: 1,
    good: false,
    note: "The grove heals and the farm degrades. You moved the harm, you didn't fix it.",
  },
  {
    id: "burn",
    label: "Burn the waste pile to clear the ground fast",
    cost: 1,
    good: false,
    note: "Fast, cheap, and it dumps the problem into the air and the next valley's lungs.",
  },
  {
    id: "fence",
    label: "Fence the grove off from every living thing, including people",
    cost: 2,
    good: false,
    note: "A grove nobody can reach is a grove nobody defends. Access is part of restoration.",
  },
];

const BUDGET = 5;

export default function ForestiaCapstone() {
  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<null | { win: boolean }>(null);
  const { closeModal, awardCrystal, grantXp, awardBadge, progressQuest } = useGameStore();

  const spent = picked.reduce((sum, id) => sum + (ACTIONS.find((a) => a.id === id)?.cost ?? 0), 0);

  function toggle(id: string) {
    if (result) return;
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      const action = ACTIONS.find((a) => a.id === id)!;
      if (spent + action.cost > BUDGET) return prev;
      return [...prev, id];
    });
  }

  function submit() {
    const good = picked.filter((id) => ACTIONS.find((a) => a.id === id)?.good).length;
    const bad = picked.length - good;
    const win = good === 3 && bad === 0;
    setResult({ win });
    if (win) {
      awardBadge("eco_warrior");
      progressQuest("recycling_rookie");
      awardCrystal("life");
    } else {
      grantXp(15);
    }
  }

  return (
    <div className="eq-modal-backdrop">
      <div className="eq-panel eq-panel-wide">
        <header>
          <h2>The Ancient Tree</h2>
          <span>Forestia capstone · Life Crystal</span>
        </header>
        <p className="eq-prompt">
          You have {BUDGET} effort points. Restore this grove — and don't push the damage somewhere else to do it.
        </p>
        <div className="eq-actions-grid">
          {ACTIONS.map((a) => {
            const on = picked.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                className={`eq-action ${on ? "is-on" : ""} ${result ? (a.good ? "is-good" : "is-bad") : ""}`}
                onClick={() => toggle(a.id)}
                disabled={!!result}
              >
                <span className="eq-action-cost">{a.cost}</span>
                <span>{a.label}</span>
                {result && <em>{a.note}</em>}
              </button>
            );
          })}
        </div>
        <div className="eq-budget">
          Effort spent: {spent} / {BUDGET}
        </div>
        {result && (
          <div className={`eq-feedback ${result.win ? "is-right" : "is-wrong"}`}>
            <strong>{result.win ? "The Life Crystal awakens." : "The grove recovers — somewhere else pays for it."}</strong>
            <p>
              {result.win
                ? "Mixed natives, deadwood left standing, and the dump cut off at the source. Nothing was exported. That's restoration."
                : "Every choice you make has a downstream owner. Rework the plan so no one else absorbs the cost."}
            </p>
          </div>
        )}
        <div className="eq-dialogue-actions">
          {!result ? (
            <button type="button" className="eq-primary" disabled={picked.length === 0} onClick={submit}>
              Commit the plan
            </button>
          ) : (
            <>
              {!result.win && (
                <button
                  type="button"
                  className="eq-ghost"
                  onClick={() => {
                    setResult(null);
                    setPicked([]);
                  }}
                >
                  Rework it
                </button>
              )}
              <button type="button" className="eq-primary" onClick={closeModal}>
                Leave the grove
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
