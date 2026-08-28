import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { INTERACTIONS } from "@/game/content";

export default function InteractionModal({ id }: { id: string }) {
  const interaction = INTERACTIONS[id];
  const [picked, setPicked] = useState<number | null>(null);
  const { closeModal, completeLesson, grantXp, progressQuest, awardBadge } = useGameStore();

  if (!interaction) return null;
  const option = picked !== null ? interaction.options[picked] : null;

  function choose(index: number) {
    if (picked !== null || !interaction) return;
    setPicked(index);
    const opt = interaction.options[index];
    if (opt?.correct) {
      const fresh = completeLesson(interaction.id, interaction.xp);
      if (!fresh) grantXp(3);
      if (interaction.questProgress) progressQuest(interaction.questProgress);
      if (interaction.badge) awardBadge(interaction.badge);
    } else {
      grantXp(5);
    }
  }

  return (
    <div className="eq-modal-backdrop">
      <div className="eq-panel">
        <header>
          <h2>{interaction.title}</h2>
          <span>{interaction.speaker}</span>
        </header>
        <p className="eq-prompt">{interaction.prompt}</p>
        <div className="eq-options">
          {interaction.options.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              disabled={picked !== null}
              className={`eq-option ${picked === i ? (opt.correct ? "is-right" : "is-wrong") : ""}`}
              onClick={() => choose(i)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {option && (
          <div className={`eq-feedback ${option.correct ? "is-right" : "is-wrong"}`}>
            <strong>{option.correct ? "That holds up." : "Not quite."}</strong>
            <p>{option.feedback}</p>
          </div>
        )}
        <div className="eq-dialogue-actions">
          <button type="button" className="eq-primary" onClick={closeModal} disabled={picked === null}>
            Back to the field
          </button>
        </div>
      </div>
    </div>
  );
}
