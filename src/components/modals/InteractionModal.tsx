import { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './InteractionModal.css';

// Lesson content database
const LESSONS: Record<string, { title: string; icon: string; content: string; fact: string; xp: number }> = {
  biodiversity_01: {
    icon: '🌲', title: 'Forest Biodiversity',
    content: 'Forests are home to over 80% of the world\'s terrestrial biodiversity. A single ancient oak can support up to 2,300 different species — from lichens and mosses to insects, birds, and mammals. Every tree is an ecosystem in itself.',
    fact: '🌍 Fact: Tropical forests contain more than half of Earth\'s plant and animal species, yet cover less than 7% of land.',
    xp: 30,
  },
  pollution_01: {
    icon: '🥀', title: 'Effects of Deforestation',
    content: 'When forests are damaged or destroyed, the consequences extend far beyond the loss of trees. Soil erosion accelerates, water cycles are disrupted, and carbon stored over centuries is released into the atmosphere. Habitat loss pushes many species toward extinction.',
    fact: '⚠ Fact: We lose roughly 10 million hectares of forest per year — an area the size of Iceland.',
    xp: 30,
  },
  deforestation_01: {
    icon: '🏕️', title: 'Ranger\'s Mission',
    content: 'Forest rangers are the guardians of the wilderness. They monitor wildlife populations, prevent illegal logging, manage fires, and guide reforestation efforts. Their work is critical to maintaining the balance of forest ecosystems for future generations.',
    fact: '🌱 Fact: Over 12 billion trees are planted every year in reforestation programs globally.',
    xp: 40,
  },
  recycling_01: {
    icon: '♻️', title: 'The Recycling Cycle',
    content: 'Recycling transforms waste materials into new products, reducing the need to extract raw resources. Recycling one tonne of paper saves 17 trees. Recycling aluminium uses 95% less energy than producing it from raw ore.',
    fact: '💡 Fact: If everyone recycled their newspaper, we could save 250 million trees per year.',
    xp: 35,
  },
  pollution_water_01: {
    icon: '🏭', title: 'Industrial Water Pollution',
    content: 'Factories and industrial sites can discharge heavy metals, chemicals, and heated water into rivers. These pollutants damage aquatic ecosystems, harm fish populations, contaminate drinking water, and can accumulate in the food chain — ultimately affecting human health.',
    fact: '💧 Fact: About 80% of global wastewater is released into the environment without treatment.',
    xp: 35,
  },
  water_cycle_01: {
    icon: '💧', title: 'The Water Cycle',
    content: 'Water is constantly moving through the environment — evaporating from oceans and lakes, condensing into clouds, and falling as rain or snow. Forests are vital to this cycle: they absorb rainfall, filter it through soil, and slowly release it into rivers and aquifers.',
    fact: '🌊 Fact: Less than 3% of Earth\'s water is freshwater, and most of that is locked in ice caps.',
    xp: 30,
  },
  water_treat_01: {
    icon: '🚰', title: 'Water Treatment',
    content: 'Water treatment plants remove contaminants from water, making it safe to drink. The process includes screening debris, settling particles, filtering through sand and gravel, and disinfecting with chlorine or UV light. Without treatment, waterborne diseases would be widespread.',
    fact: '🔬 Fact: Over 2 billion people lack access to safe drinking water at home.',
    xp: 40,
  },
};

export function InteractionModal() {
  const { activeModal, closeModal, completeLesson, completedLessons, addXP } = useGameStore();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeModal) dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal, closeModal]);

  if (!activeModal) return null;

  const lesson = LESSONS[activeModal.id];
  if (!lesson) {
    return (
      <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
        <div className="modal-card glass animate-fadeIn" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Interactive Object</h2>
            <button id="modal-close-btn" className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
          </div>
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px' }}>
            Coming soon — this interaction is being built!
          </p>
        </div>
      </div>
    );
  }

  const alreadyCompleted = completedLessons.includes(activeModal.id);

  const handleComplete = () => {
    if (!alreadyCompleted) {
      completeLesson(activeModal.id);
    }
    closeModal();
  };

  return (
    <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-label={lesson.title}>
      <div
        className="modal-card glass animate-fadeIn"
        ref={dialogRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon animate-float">{lesson.icon}</div>
          <h2 className="modal-title">{lesson.title}</h2>
          <button id="modal-close-btn" className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
        </div>

        {/* Content */}
        <div className="modal-body">
          <p className="modal-text">{lesson.content}</p>

          <div className="modal-fact glass">
            <p>{lesson.fact}</p>
          </div>

          {/* XP Reward indicator */}
          {!alreadyCompleted && (
            <div className="modal-xp-reward">
              <span>📚 Complete to earn</span>
              <span className="modal-xp-badge">+{lesson.xp} XP</span>
            </div>
          )}
          {alreadyCompleted && (
            <div className="modal-completed-badge">
              ✓ Lesson completed
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            id="modal-got-it-btn"
            className={`btn ${alreadyCompleted ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleComplete}
          >
            {alreadyCompleted ? 'Review Again' : `Got it! Earn +${lesson.xp} XP →`}
          </button>
        </div>
      </div>
    </div>
  );
}
