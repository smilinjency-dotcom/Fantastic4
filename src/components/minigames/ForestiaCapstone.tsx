import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './Minigames.css';

export function ForestiaCapstone() {
  const { closeModal, addXP, setF05CapstoneDone, addUnderstanding, awakenCrystal } = useGameStore();
  const [actionsLeft, setActionsLeft] = useState(8);
  const [completed, setCompleted] = useState(false);

  const [stats, setStats] = useState({
    trees: 30,
    undergrowth: 30,
    beetles: 40,
    birds: 30,
    wildlife: 40
  });

  const handleAction = (type: 'plant' | 'clear' | 'relocate' | 'protect') => {
    if (actionsLeft <= 0 || completed) return;

    let nextStats = { ...stats };
    if (type === 'plant') {
      nextStats.trees += 20;
      nextStats.birds += 10;
      nextStats.undergrowth -= 10;
    } else if (type === 'clear') {
      nextStats.undergrowth += 20;
      nextStats.wildlife -= 10;
    } else if (type === 'relocate') {
      nextStats.wildlife += 15;
      nextStats.beetles -= 5;
    } else if (type === 'protect') {
      nextStats.beetles += 15;
      nextStats.birds += 5;
    }

    // Clamp between 0 and 100
    for (const key in nextStats) {
      nextStats[key as keyof typeof nextStats] = Math.max(0, Math.min(100, nextStats[key as keyof typeof nextStats]));
    }

    setStats(nextStats);
    setActionsLeft(prev => prev - 1);
  };

  const handleFinish = () => {
    const avg = (stats.trees + stats.undergrowth + stats.beetles + stats.birds + stats.wildlife) / 5;
    if (avg >= 70) {
      setCompleted(true);
      setTimeout(() => {
        addXP(150);
        addUnderstanding(40);
        setF05CapstoneDone();
        awakenCrystal('forestia');
        closeModal();
      }, 3000);
    } else {
      alert(`Average health: ${avg}%. Try to reach at least 70% average across all stats.`);
      setActionsLeft(8);
      setStats({ trees: 30, undergrowth: 30, beetles: 40, birds: 30, wildlife: 40 });
    }
  };

  const renderBar = (label: string, value: number) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.5)', height: 12, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ background: value >= 70 ? '#22c55e' : value >= 40 ? '#eab308' : '#ef4444', height: '100%', width: `${value}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={completed ? () => {} : closeModal}>
      <div className="minigame-box glass" onClick={(e) => e.stopPropagation()}>
        <h2>FORESTIA RESTORATION</h2>
        <p>Actions remaining: {actionsLeft}</p>

        {completed ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h1 style={{ color: '#22c55e' }}>THRIVING FOREST</h1>
            <p>You have restored the balance of Forestia!</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '20px 0' }}>
              <button className="btn btn-secondary" onClick={() => handleAction('plant')} disabled={actionsLeft === 0}>
                🌳 Plant
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('clear')} disabled={actionsLeft === 0}>
                🌿 Clear Invasive
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('relocate')} disabled={actionsLeft === 0}>
                🐿️ Relocate Wildlife
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('protect')} disabled={actionsLeft === 0}>
                🛡️ Protect Habitat
              </button>
            </div>

            <div style={{ padding: '10px 0' }}>
              {renderBar('Trees', stats.trees)}
              {renderBar('Undergrowth', stats.undergrowth)}
              {renderBar('Beetles', stats.beetles)}
              {renderBar('Birds', stats.birds)}
              {renderBar('Wildlife', stats.wildlife)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              {actionsLeft === 0 ? (
                <button className="btn btn-primary" onClick={handleFinish}>Complete Capstone</button>
              ) : (
                <button className="btn" style={{ opacity: 0.5 }} disabled>Complete Capstone</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
