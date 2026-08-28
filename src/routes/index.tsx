import { createFileRoute } from "@tanstack/react-router";
import GameShell from "@/components/GameShell";

const title = "EcoQuest — Learn. Explore. Restore.";
const description =
  "An educational environmental RPG: explore Forestia and Aquaria as an Eco Guardian, solve real ecology problems, and awaken the Earth Core's crystals.";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <GameShell />;
}
