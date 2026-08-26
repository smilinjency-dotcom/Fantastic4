import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './DialogueModal.css';

const DIALOGUES: Record<string, string[]> = {
  eco_guide_01: [
    "Hello! I am ECO, your environmental guide.",
    "Welcome to Greenhaven, the heart of our world.",
    "Our world is divided by competing human needs and unintended consequences.",
    "Your goal is to balance Understanding and Restoration to heal the Earth Core.",
    "Use the portals to visit Forestia and Aquaria."
  ]
};

export function DialogueModal() {
  const { activeModal, closeModal } = useGameStore();
  const [lineIndex, setLineIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeModal && activeModal.type === 'dialogue') {
      dialogRef.current?.focus();
      setLineIndex(0);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal, closeModal]);

  if (!activeModal || activeModal.type !== 'dialogue') return null;

  const dialogueKey = activeModal.id;
  const lines = DIALOGUES[dialogueKey] || ["..."];
  
  const currentLine = lines[lineIndex];
  const isLastLine = lineIndex === lines.length - 1;

  const handleNext = () => {
    if (isLastLine) {
      setLineIndex(0);
      closeModal();
    } else {
      setLineIndex(prev => prev + 1);
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
          <h2 className="dialogue-name">ECO</h2>
          <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
        </div>
        
        <div className="dialogue-content">
          <p className="dialogue-text">{currentLine}</p>
        </div>
        
        <div className="dialogue-footer">
          <button className="btn btn-primary" onClick={handleNext}>
            {isLastLine ? "End" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
