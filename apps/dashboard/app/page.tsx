import { cookies } from "next/headers";
import { TrainingRadarBoard } from "../components/TrainingRadarBoard";
import { getTrainingRadarData } from "../lib/trainingRadar";
import {
  isTrainingRadarAuthConfigured,
  isValidTrainingRadarSession,
  TRAINING_RADAR_SESSION_COOKIE,
} from "../lib/trainingRadarAuth";

export const dynamic = "force-dynamic";

function TrainingRadarLogin({ auth }: { auth?: string }) {
  const configured = isTrainingRadarAuthConfigured();

  return (
    <main className="radar-login-shell">
      <section className="radar-login" aria-labelledby="training-radar-login-title">
        <p className="radar-login__eyebrow">Private training surface</p>
        <h1 id="training-radar-login-title">Training Radar</h1>
        {configured ? (
          <form action="/api/training-radar/session" method="post">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
            />
            {auth === "invalid" && <p className="radar-login__error">That password was not accepted.</p>}
            {auth === "limited" && (
              <p className="radar-login__error">Too many attempts. Please wait 15 minutes and try again.</p>
            )}
            <button type="submit">Open radar</button>
          </form>
        ) : (
          <p className="radar-login__error">Page access has not been configured.</p>
        )}
      </section>
    </main>
  );
}

export default async function TrainingRadarPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(TRAINING_RADAR_SESSION_COOKIE)?.value;

  if (!isValidTrainingRadarSession(session)) {
    const { auth } = await searchParams;
    return <TrainingRadarLogin auth={auth} />;
  }

  const data = await getTrainingRadarData();

  return <TrainingRadarBoard data={data} />;
}
