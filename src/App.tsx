import './App.css';
import { PhaserGame }        from './components/PhaserGame';
import { HUD }               from './components/ui/HUD';
import { WorldSelector }     from './components/ui/WorldSelector';
import { InteractionModal }  from './components/modals/InteractionModal';
import { DialogueModal }     from './components/modals/DialogueModal';
import { useGameStore }      from './stores/gameStore';
import { FoodWebMinigame } from './components/minigames/FoodWebMinigame';
import { ForestiaCapstone } from './components/minigames/ForestiaCapstone';

export default function App() {
  const currentWorld = useGameStore(s => s.currentWorld);
  const activeModal = useGameStore(s => s.activeModal);

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
      <DialogueModal />

      {activeModal?.type === 'minigame' && activeModal.id === 'f02_foodweb' && <FoodWebMinigame />}
      {activeModal?.type === 'minigame' && activeModal.id === 'f05_capstone' && <ForestiaCapstone />}
      {activeModal?.type === 'quest' && activeModal.id === 'f05_capstone' && <ForestiaCapstone />}
    </div>
  );
}
