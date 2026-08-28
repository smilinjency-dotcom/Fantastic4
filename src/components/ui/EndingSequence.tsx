import { useGameStore } from "@/stores/gameStore";
import { BADGES, CRYSTALS } from "@/game/content";

export default function EndingSequence() {
  const { crystals, level, xp, badges, closeModal } = useGameStore();
  const lit = crystals.length;

  return (
    <div className="eq-modal-backdrop">
      <div className="eq-panel eq-panel-wide eq-ending">
        <header>
          <h2>Earth Core — {lit} of 5 awake</h2>
          <span>Greenhaven</span>
        </header>

        <div className="eq-socket-row">
          {CRYSTALS.map((c) => (
            <div key={c.id} className={`eq-socket ${crystals.includes(c.id) ? "is-lit" : ""}`}>
              <span className="eq-socket-gem">◈</span>
              <strong>{c.name}</strong>
              <em>{c.region}</em>
              {!c.available && <span className="eq-soon">coming soon</span>}
            </div>
          ))}
        </div>

        <p className="eq-prompt">
          Forestia breathes again and Crystal Lake runs clear. Nothing was defeated — a grove was replanted properly and
          a river was balanced between the people who need it. That was enough to wake two crystals.
        </p>
        <p className="eq-prompt">
          Three sockets stay dark. <strong>Wasteland</strong> waits for Renewal, <strong>Energia</strong> for Energy,
          and <strong>Climatierra</strong> for Climate. The neglect that dimmed them is still out there, patient and
          ordinary.
        </p>

        <div className="eq-ending-stats">
          <span>Level {level}</span>
          <span>{xp} XP banked</span>
          <span>
            {badges.length} badge{badges.length === 1 ? "" : "s"}
          </span>
        </div>
        {badges.length > 0 && (
          <div className="eq-badges">
            {badges.map((b) => (
              <span key={b} className="eq-badge" title={BADGES[b]?.description}>
                {BADGES[b]?.name ?? b}
              </span>
            ))}
          </div>
        )}

        <div className="eq-dialogue-actions">
          <button type="button" className="eq-primary" onClick={closeModal}>
            Keep exploring
          </button>
        </div>
      </div>
    </div>
  );
}
