import { useGameStore } from "@/stores/gameStore";
import { WORLDS, type WorldId } from "@/game/content";

const ORDER: WorldId[] = ["greenhaven", "forestia", "aquaria"];

export default function WorldSelector() {
  const currentWorld = useGameStore((s) => s.currentWorld);
  const worldHealth = useGameStore((s) => s.worldHealth);
  const setWorld = useGameStore((s) => s.setWorld);

  return (
    <div className="eq-worlds">
      {ORDER.map((id) => (
        <button
          key={id}
          type="button"
          className={`eq-world-btn ${currentWorld === id ? "is-active" : ""}`}
          onClick={() => setWorld(id)}
        >
          <strong>{WORLDS[id].name}</strong>
          <span>{WORLDS[id].tagline}</span>
          <em className={`eq-health eq-health-${worldHealth[id]}`}>{worldHealth[id]}</em>
        </button>
      ))}
    </div>
  );
}
