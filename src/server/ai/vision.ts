import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

export const analyzeTrash = createServerFn({ method: "POST" })
  .validator((d: { imageBase64: string }) => d)
  .handler(async ({ data }) => {
    const { imageBase64 } = data;

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const systemPrompt = `You are the Eco-Lens, a highly advanced AI scanner built into the Eco Guardian's toolkit.
The user will upload an image of real-world trash or waste.
1. Identify the object.
2. Determine the best way to dispose of it (e.g., recycling bin, compost, landfill, specialized e-waste).
3. Explain WHY in 1-2 short sentences.
Keep the tone helpful and scientific.`;

    try {
      const { text } = await generateText({
        // The user confirmed we can use a vision model for this
        model: groq("llama-3.2-11b-vision-preview"),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              { type: 'image', image: imageBase64 },
            ],
          },
        ],
      });

      return { text, success: true };
    } catch (error: any) {
      console.error("Eco Lens Error:", error);
      return { text: "The Eco-Lens encountered interference. Please try again.", success: false };
    }
  });
