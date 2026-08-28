import { Suspense, lazy, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useGameStore } from "@/stores/gameStore";
import Login from "./Login";
import HUD from "./ui/HUD";
import WorldSelector from "./ui/WorldSelector";
import DialogueModal from "./modals/DialogueModal";
import InteractionModal from "./modals/InteractionModal";
import AiChatModal from "./modals/AiChatModal";
import EcoLensModal from "./modals/EcoLensModal";
import FoodWebMinigame from "./minigames/FoodWebMinigame";
import ForestiaCapstone from "./minigames/ForestiaCapstone";
import AquariaCapstone from "./minigames/AquariaCapstone";
import EndingSequence from "./ui/EndingSequence";

const PhaserGame = lazy(() => import("@/game/PhaserGame"));

function ActiveModal() {
  const modal = useGameStore((s) => s.activeModal);
  if (!modal) return null;
  if (modal.kind === "dialogue") return <DialogueModal id={modal.id} />;
  if (modal.kind === "interaction") return <InteractionModal id={modal.id} />;
  if (modal.kind === "ai_chat") return <AiChatModal id={modal.id} />;
  if (modal.kind === "eco_lens") return <EcoLensModal />;
  if (modal.kind === "minigame") return <FoodWebMinigame />;
  if (modal.kind === "ending") return <EndingSequence />;
  if (modal.kind === "capstone")
    return modal.id === "ancient_tree" ? <ForestiaCapstone /> : <AquariaCapstone />;
  return null;
}

function Toast() {
  const toast = useGameStore((s) => s.toast);
  if (!toast) return null;
  return <div className="eq-toast">{toast.text}</div>;
}

export default function GameShell() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const hydrated = useGameStore((s) => s.hydrated);
  const crystals = useGameStore((s) => s.crystals);
  const openModal = useGameStore((s) => s.openModal);
  const endingShown = useGameStore((s) => s.endingSeen);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) useGameStore.getState().reset();
    });
    void supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setChecking(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;
    (async () => {
      const userId = session.user.id;
      const [{ data: progress }, { data: profile }, { data: roles }] = await Promise.all([
        supabase.from("player_progress").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);
      if (cancelled) return;
      const name =
        profile?.display_name ??
        (session.user.email ? session.user.email.split("@")[0]! : "Eco Guardian");
      const role = roles?.[0]?.role ?? "student";
      if (!progress) {
        await supabase.from("player_progress").insert({ user_id: userId });
      }
      useGameStore.getState().hydrate(progress ?? {}, userId, name, role);
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  // Ending fires once, the first time both reachable crystals are lit.
  useEffect(() => {
    if (crystals.length >= 2 && !endingShown) {
      useGameStore.setState({ endingSeen: true });
      const timer = setTimeout(() => openModal({ kind: "ending", id: "finale" }), 900);
      return () => clearTimeout(timer);
    }
    return;
  }, [crystals.length, endingShown, openModal]);

  if (checking) {
    return (
      <div className="eq-boot">
        <span>◈ EcoQuest</span>
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="eq-root">
      <Suspense fallback={<div className="eq-boot"><span>◈ Loading the biome…</span></div>}>
        {hydrated && <PhaserGame />}
      </Suspense>
      {hydrated && (
        <>
          <HUD />
          <WorldSelector />
          <ActiveModal />
          <Toast />
        </>
      )}
    </div>
  );
}
