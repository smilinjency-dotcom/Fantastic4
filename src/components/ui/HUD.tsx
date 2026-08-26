import { useGameStore } from '../../stores/gameStore';
import './HUD.css';

export function HUD() {
  const { playerName, level, xp, xpToNext, quests, badges } = useGameStore();
  const completedQuests = quests.filter(q => q.completed).length;
  const unlockedBadges  = badges.filter(b => b.unlocked).length;
  const xpPct = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div className="hud" aria-label="Game HUD">

      {/* === Player Panel === */}
      <div className="hud-player glass">
        <div className="hud-avatar" aria-hidden="true">🌿</div>
        <div className="hud-player-info">
          <div className="hud-name">{playerName}</div>
          <div className="hud-level">Level {level}</div>
          <div className="hud-xp-bar" role="progressbar" aria-valuenow={xp} aria-valuemax={xpToNext} aria-label="XP">
            <div className="hud-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="hud-xp-text">{xp} / {xpToNext} XP</div>
        </div>
      </div>

      {/* === Mini Stats === */}
      <div className="hud-stats glass">
        <div className="hud-stat">
          <span className="hud-stat-icon">📋</span>
          <span className="hud-stat-val">{completedQuests}</span>
          <span className="hud-stat-label">Quests</span>
        </div>
        <div className="hud-stat-divider" />
        <div className="hud-stat">
          <span className="hud-stat-icon">🏅</span>
          <span className="hud-stat-val">{unlockedBadges}</span>
          <span className="hud-stat-label">Badges</span>
        </div>
      </div>

      {/* === Controls hint === */}
      <div className="hud-controls glass">
        <span>WASD / ↑↓←→ Move</span>
        <span className="hud-key">[E]</span>
        <span>Interact</span>
      </div>

    </div>
  );
}
