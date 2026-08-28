import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { chatWithNpc } from "@/server/ai/chat";

export default function AiChatModal({ id }: { id: string }) {
  const { closeModal, worldHealth } = useGameStore();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Derive speaker name from id
  let speaker = "Guide";
  if (id === "fo_ranger") speaker = "Ranger Hollis";
  if (id === "gh_eco") speaker = "ECO";
  if (id === "fo_nyla") speaker = "Dr. Nyla";
  if (id === "aq_mara") speaker = "Mara";

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const res = await chatWithNpc({
      data: {
        prompt: userMessage,
        npcId: id,
        worldHealth,
        history: messages,
      }
    });

    setMessages((prev) => [...prev, { role: "assistant", content: res.text }]);
    setIsLoading(false);
  }

  return (
    <div className="eq-modal-backdrop">
      <div className="eq-dialogue" style={{ minWidth: "400px" }}>
        <div className="eq-speaker">{speaker} (AI)</div>
        <div className="eq-chat-history" style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "1rem" }}>
          {messages.length === 0 && (
            <p className="text-muted-foreground text-sm italic">You approach {speaker}...</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
              <span className={`inline-block px-3 py-2 rounded-lg text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {m.content}
              </span>
            </div>
          ))}
          {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Thinking...</p>}
        </div>
        
        <form onSubmit={sendMessage} className="flex gap-2 w-full mt-4">
          <input
            type="text"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something..."
            disabled={isLoading}
            autoFocus
          />
          <button type="submit" disabled={isLoading} className="eq-primary">
            Send
          </button>
        </form>

        <div className="eq-dialogue-actions mt-4">
          <button type="button" className="eq-ghost" onClick={closeModal}>
            Walk away
          </button>
        </div>
      </div>
    </div>
  );
}
