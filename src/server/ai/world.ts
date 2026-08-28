import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

export const generateWorldDescription = createServerFn({ method: "POST" })
  .validator((d: { worldId: string; health: string; isNew: boolean }) => d)
  .handler(async ({ data }) => {
    const { worldId, health, isNew } = data;

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const worlds: Record<string, string> = {
      greenhaven: "Greenhaven, the hub of the Earth Core",
      forestia: "Forestia, a dense region of ancient trees and biodiversity",
      aquaria: "Aquaria, a network of rivers, lakes, and treatment facilities",
    };

    const worldContext = worlds[worldId] || worldId;
    
    let prompt = `Write a 2-sentence atmospheric, sensory description of entering ${worldContext}. The current ecological health of this region is: ${health}.`;
    if (!isNew) {
      prompt = `Write a 1-sentence atmospheric update about the current state of ${worldContext}, which is currently: ${health}.`;
    }

    try {
      const { text } = await generateText({
        model: groq("llama-3.1-8b-instant"),
        system: "You are a master storyteller writing flavor text for an RPG game.",
        prompt: prompt,
      });

      return { text, success: true };
    } catch (error: any) {
      console.error("World description error:", error);
      return { text: "", success: false };
    }
  });
