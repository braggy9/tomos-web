import { cookies } from "next/headers";
import { GigRadarBoard } from "../../components/GigRadarBoard";
import { getGigRadarData } from "../../lib/gigRadar";
import { isValidTrainingRadarSession, TRAINING_RADAR_SESSION_COOKIE } from "../../lib/trainingRadarAuth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GigsPage() {
  const cookieStore = await cookies();
  if (!isValidTrainingRadarSession(cookieStore.get(TRAINING_RADAR_SESSION_COOKIE)?.value)) redirect("/");
  return <GigRadarBoard data={await getGigRadarData()} />;
}
