import { useGameStore, xpToNext } from "@/stores/gameStore";
import { BADGES, CRYSTALS, QUESTS, WORLDS } from "@/game/content";
import { supabase } from "@/integrations/supabase/client";

export default function HUD() {
  const { xp, level, crystals, badges, quests, worldHealth, currentWorld, displayName, openModal } =
    useGameStore();

  const activeQuestId = Object.keys(quests).find((id) => (quests[id] ?? 0) < (QUESTS[id]?.steps ?? 99));
  const activeQuest = activeQuestId ? QUESTS[activeQuestId] : null;
  const pct = Math.min(100, Math.round((xp / xpToNext(level)) * 100));
  const health = worldHealth[currentWorld] ?? "damaged";

  return (
    <div className="eq-hud">
      <div className="eq-hud-panel eq-hud-left">
        <div className="eq-hud-row">
          <span className="eq-level">Lv {level}</span>
          <span className="eq-name">{displayName}</span>
        </div>
        <div className="eq-xp">
          <div className="eq-xp-fill" style={{ width: `${pct}%` }} />
          <span className="eq-xp-text">
            {xp} / {xpToNext(level)} XP
          </span>
        </div>
        <div className="eq-crystals" title="Earth Core sockets">
          {CRYSTALS.map((c) => (
            <span
              key={c.id}
              className={`eq-crystal ${crystals.includes(c.id) ? "is-lit" : ""} ${c.available ? "" : "is-locked"}`}
              title={`${c.name} — ${c.region}${c.available ? "" : " (coming soon)"}`}
            >
              ◈
            </span>
          ))}
        </div>
      </div>

      <div className="eq-hud-panel eq-hud-right">
        <div className="eq-world">
          <strong>{WORLDS[currentWorld].name}</strong>
          <span className={`eq-health eq-health-${health}`}>{health}</span>
        </div>
        {activeQuest ? (
          <div className="eq-quest">
            <span className="eq-quest-label">Quest</span>
            <strong>{activeQuest.name}</strong>
            <span className="eq-quest-steps">
              {quests[activeQuest.id] ?? 0} / {activeQuest.steps}
            </span>
            <p>{activeQuest.description}</p>
          </div>
        ) : (
          <div className="eq-quest">
            <span className="eq-quest-label">Quest</span>
            <strong>Explore</strong>
            <p>Find someone with a problem worth solving.</p>
          </div>
        )}
        {badges.length > 0 && (
          <div className="eq-badges">
            {badges.map((b) => (
              <span key={b} className="eq-badge" title={BADGES[b]?.description}>
                {BADGES[b]?.name ?? b}
              </span>
            ))}
          </div>
        )}
        <div className="eq-hud-actions">
          {crystals.length >= 2 && (
            <button type="button" onClick={() => openModal({ kind: "ending", id: "finale" })}>
              Earth Core report
            </button>
          )}
          <button type="button" onClick={() => void supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>

      <div className="eq-controls">WASD / arrows to move · E to interact</div>
    </div>
  );
}
