import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './DialogueModal.css';

const DIALOGUES: Record<string, { speaker: string; text: string; options: { text: string; next: string | null; action?: () => void }[] }> = {
  eco_guide_01: {
    speaker: "ECO",
    text: "The planet has been asking us the same question for a very long time. Do you understand what you're changing?",
    options: [
      { text: "What do you mean?", next: "eco_guide_02", action: () => useGameStore.getState().addXp(10) }
    ]
  },
  eco_guide_02: {
    speaker: "ECO",
    text: "Look at the Earth Core. The crystals are powered by understanding, not magic. Step into Forestia when you're ready.",
    options: [
      { text: "I'm ready.", next: null }
    ]
  },
  f01_ranger: {
    speaker: "Ranger",
    text: "Something's thinning out here. Not just the trees. Can you see what else is missing?",
    options: [
      { text: "Animals.", next: "f01_ranger_correct", action: () => { useGameStore.getState().addUnderstanding(5); useGameStore.getState().addXp(15); } },
      { text: "Water.", next: "f01_ranger_wrong" },
      { text: "Nothing. It looks normal.", next: "f01_ranger_wrong" }
    ]
  },
  f01_ranger_correct: {
    speaker: "Ranger",
    text: "Exactly. The habitat is gone. Look around for clues, then head north to the Living Forest.",
    options: [{ text: "Got it.", next: null }]
  },
  f01_ranger_wrong: {
    speaker: "Ranger",
    text: "Look closer at the empty nest and the struggling plants.",
    options: [{ text: "I'll keep looking.", next: null }]
  },
  f02_researcher: {
    speaker: "Researcher",
    text: "A forest isn't just a collection of trees. It's a relationship. When one species disappears, others lose food and shelter.",
    options: [
      { text: "Everything is connected?", next: "f02_researcher_2", action: () => useGameStore.getState().addXp(15) }
    ]
  },
  f02_researcher_2: {
    speaker: "Researcher",
    text: "Precisely. Try repairing the food web here to see how it works.",
    options: [{ text: "I'll try.", next: null, action: () => useGameStore.getState().openModal('minigame', 'f02_foodweb') }]
  }
};

export function DialogueModal() {
  const { activeModal, closeModal } = useGameStore();
  const [dialogueId, setDialogueId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeModal && activeModal.type === 'dialogue') {
      setDialogueId(activeModal.id);
      dialogRef.current?.focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal, closeModal]);

  if (!activeModal || activeModal.type !== 'dialogue' || !dialogueId) return null;

  const currentDialogue = DIALOGUES[dialogueId];

  if (!currentDialogue) {
    return (
      <div className="modal-overlay">
        <div className="dialogue-box">
          <p>Dialogue not found: {dialogueId}</p>
          <button className="dialogue-btn" onClick={() => closeModal()}>Close</button>
        </div>
      </div>
    );
  }

  const handleOption = (option: { text: string; next: string | null; action?: () => void }) => {
    if (option.action) option.action();
    
    if (option.next) {
      setDialogueId(option.next);
    } else {
      closeModal();
      setDialogueId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
      <div 
        className="dialogue-box glass animate-fadeIn" 
        ref={dialogRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <div className="dialogue-header">
          <div className="dialogue-avatar">🤖</div>
          <h2 className="dialogue-name">{currentDialogue.speaker}</h2>
          <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
        </div>
        
        <div className="dialogue-content">
          <p className="dialogue-text">{currentDialogue.text}</p>
        </div>
        
        <div className="dialogue-footer">
          {currentDialogue.options.map((opt, i) => (
            <button key={i} className="btn btn-primary" onClick={() => handleOption(opt)}>
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
