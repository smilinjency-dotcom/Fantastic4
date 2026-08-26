import { useGameStore } from '../../stores/gameStore';
import './WorldSelector.css';

export function WorldSelector() {
  const { currentWorld, setWorld, forestiaState, aquariaState } = useGameStore();

  const worlds = [
    {
      id: 'forestia' as const,
      label: '🌲 Forestia',
      state: forestiaState,
      description: 'Restore the ancient forest',
    },
    {
      id: 'aquaria' as const,
      label: '💧 Aquaria',
      state: aquariaState,
      description: 'Clean the river & coast',
    },
  ];

  const stateColor: Record<string, string> = {
    damaged:    '#ef4444',
    recovering: '#f59e0b',
    thriving:   '#22c55e',
  };

  const stateLabel: Record<string, string> = {
    damaged:    '⚠ Damaged',
    recovering: '↑ Recovering',
    thriving:   '✓ Thriving',
  };

  return (
    <div className="world-selector" aria-label="World selector">
      {worlds.map(w => (
        <button
          key={w.id}
          id={`world-btn-${w.id}`}
          className={`world-btn glass ${currentWorld === w.id ? 'active' : ''}`}
          onClick={() => setWorld(w.id)}
          aria-pressed={currentWorld === w.id}
          aria-label={`Switch to ${w.label}`}
        >
          <span className="world-btn-label">{w.label}</span>
          <span
            className="world-btn-state"
            style={{ color: stateColor[w.state] }}
          >
            {stateLabel[w.state]}
          </span>
        </button>
      ))}
    </div>
  );
}
