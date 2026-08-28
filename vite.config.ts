import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tsConfigPaths(), tailwindcss()],
  },
  server: {
    // Vercel deployment preset (Nitro). Change to 'cloudflare' or 'node' as needed.
    preset: "vercel",
    // Redirect TanStack Start's bundled server entry to src/server.ts (SSR error wrapper).
    entry: "server",
  },
});
