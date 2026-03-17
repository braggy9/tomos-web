"use client";

import { useParams } from "next/navigation";
import { useSession } from "../../../hooks/useFitness";
import { Spinner, Card } from "@tomos/ui";
import Link from "next/link";

export default function SessionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session, isLoading } = useSession(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Session not found</p>
        <Link href="/history" className="text-sm text-brand-600 hover:text-brand-700 mt-2 inline-block">
          Back to history
        </Link>
      </div>
    );
  }

  const date = new Date(session.date);
  const dateStr = date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <Link href="/history" className="text-xs text-brand-600 hover:text-brand-700 mb-3 inline-block">
        &larr; Back to history
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Session {session.sessionType}</h1>
          <p className="text-sm text-gray-400">{dateStr}</p>
        </div>
        <div className="flex gap-2">
          {session.overallRPE && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              session.overallRPE >= 9 ? "bg-red-100 text-red-700" :
              session.overallRPE >= 7 ? "bg-amber-100 text-amber-700" :
              "bg-brand-100 text-brand-700"
            }`}>
              RPE {session.overallRPE}
            </span>
          )}
          {session.weekType === "kid" && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              Kid Week
            </span>
          )}
        </div>
      </div>

      {session.notes && (
        <Card className="mb-4">
          <p className="text-sm text-gray-600">{session.notes}</p>
        </Card>
      )}

      {session.sessionExercises && session.sessionExercises.length > 0 && (
        <div className="space-y-3">
          {session.sessionExercises.map((se) => (
            <Card key={se.id}>
              <p className="text-sm font-medium text-gray-900 mb-2">{se.exercise.name}</p>
              <div className="space-y-1">
                {se.sets.map((set) => (
                  <div key={set.id} className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="text-xs text-gray-400 w-8">Set {set.setNumber}</span>
                    {set.weight != null && <span className="font-medium">{set.weight}kg</span>}
                    {set.reps != null && <span>x{set.reps}</span>}
                    {set.time != null && <span>{set.time}s</span>}
                    {set.rpe != null && (
                      <span className="text-xs text-gray-400">RPE {set.rpe}</span>
                    )}
                    {set.notes && <span className="text-xs text-gray-400">{set.notes}</span>}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {(!session.sessionExercises || session.sessionExercises.length === 0) && (
        <p className="text-sm text-gray-400 text-center py-8">No exercises recorded for this session.</p>
      )}
    </div>
  );
}
