import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { DIALOGUES } from "@/game/content";

export default function DialogueModal({ id }: { id: string }) {
  const dialogue = DIALOGUES[id];
  const [index, setIndex] = useState(0);
  const { closeModal, openModal, grantXp, startQuest, completeLesson } = useGameStore();

  if (!dialogue) return null;
  const line = dialogue.lines[index]!;
  const last = index === dialogue.lines.length - 1;

  function finish() {
    if (!dialogue) return;
    if (dialogue.startQuest) startQuest(dialogue.startQuest);
    if (dialogue.xp) {
      const fresh = completeLesson(`dlg_${dialogue.id}`, dialogue.xp);
      if (!fresh) grantXp(2);
    }
    if (dialogue.then) {
      openModal({ kind: dialogue.then.kind === "interaction" ? "interaction" : dialogue.then.kind, id: dialogue.then.id });
    } else {
      closeModal();
    }
  }

  return (
    <div className="eq-modal-backdrop">
      <div className="eq-dialogue">
        <div className="eq-speaker">{line.speaker}</div>
        <p className="eq-dialogue-text">{line.text}</p>
        <div className="eq-dialogue-actions">
          <button type="button" className="eq-ghost" onClick={closeModal}>
            Walk away
          </button>
          {last ? (
            <button type="button" className="eq-primary" onClick={finish}>
              {dialogue.actionLabel ?? "Got it"}
            </button>
          ) : (
            <button type="button" className="eq-primary" onClick={() => setIndex(index + 1)}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
