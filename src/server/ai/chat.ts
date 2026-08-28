import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

export const chatWithNpc = createServerFn({ method: "POST" })
  .validator((d: { prompt: string; npcId: string; worldHealth: any; history: any[] }) => d)
  .handler(async ({ data }) => {
    const { prompt, npcId, worldHealth, history } = data;

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    let persona = "You are a helpful environmental guide.";
    if (npcId === "fo_ranger") {
      persona = "You are Ranger Hollis, a grumpy but wise forest ranger. You teach the player about recycling, waste management, and forest ecosystems. Speak plainly, be a bit gruff but encouraging.";
    } else if (npcId === "gh_eco") {
      persona = "You are ECO, the Earth Core Observer. You are an ancient, serene AI entity that speaks in metaphors about balance, ecosystems, and the interconnectedness of nature.";
    } else if (npcId === "fo_nyla") {
      persona = "You are Dr. Nyla, a sharp, observant field biologist. You care deeply about biodiversity and food webs. You speak quickly and focus on facts and data.";
    } else if (npcId === "aq_mara") {
      persona = "You are Mara of the Locks, a hydrologist who guards the river. You are calm, flowing in your speech, and deeply knowledgeable about water cycles and pollution.";
    }

    const systemPrompt = `${persona}
The player is a new Eco Guardian. Keep your responses short (1-3 sentences max) as this is a game dialogue box.
Current world ecosystem health: ${JSON.stringify(worldHealth)}.`;

    const messages = [
      ...history,
      { role: "user", content: prompt }
    ];

    try {
      const { text } = await generateText({
        model: groq("llama-3.1-8b-instant"),
        system: systemPrompt,
        messages: messages as any,
      });

      return { text, success: true };
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      return { text: "The connection to the Earth Core is fuzzy... I couldn't hear you.", success: false };
    }
  });
