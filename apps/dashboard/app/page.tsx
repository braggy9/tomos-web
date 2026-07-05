import { TrainingRadarBoard } from "../components/TrainingRadarBoard";
import { getTrainingRadarData } from "../lib/trainingRadar";

export const dynamic = "force-dynamic";

export default async function TrainingRadarPage() {
  const data = await getTrainingRadarData();

  return <TrainingRadarBoard data={data} />;
}
