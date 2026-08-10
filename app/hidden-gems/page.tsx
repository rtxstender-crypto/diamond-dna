import { HiddenGemsDashboard } from "@/components/hidden-gems-dashboard";
import { getHiddenGemPlayers } from "@/data/player-service";

export default async function HiddenGemsPage() {
  const players = await getHiddenGemPlayers();
  return <HiddenGemsDashboard initialPlayers={players}/>;
}
