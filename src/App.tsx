import './App.css';
import { PhaserGame }        from './components/PhaserGame';
import { HUD }               from './components/ui/HUD';
import { WorldSelector }     from './components/ui/WorldSelector';
import { InteractionModal }  from './components/modals/InteractionModal';
import { useGameStore }      from './stores/gameStore';

export default function App() {
  const currentWorld = useGameStore(s => s.currentWorld);

  return (
    <div className="app-shell">
      {/* ===== Game Canvas ===== */}
      <div className="game-viewport">
        <PhaserGame world={currentWorld} />
      </div>

      {/* ===== React HUD Layer ===== */}
      <div className="hud-layer">
        <HUD />
        <WorldSelector />
      </div>

      {/* ===== Modals ===== */}
      <InteractionModal />
    </div>
  );
}
