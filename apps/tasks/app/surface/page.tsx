"use client";

import { useRouter } from "next/navigation";
import { useSmartSurface } from "../../hooks/useSmartSurface";
import { useUpdateTask } from "../../hooks/useTasks";
import { Card, Badge, Spinner, EmptyState, Button } from "@tomos/ui";
import { useToast } from "@tomos/ui";

export default function SmartSurfacePage() {
  const router = useRouter();
  const { data: recommendations, isLoading, error, refetch } = useSmartSurface();
  const updateTask = useUpdateTask();
  const { toast } = useToast();

  const handleStart = (taskId: string) => {
    updateTask.mutate(
      { id: taskId, data: { status: "In Progress" } },
      {
        onSuccess: () => {
          toast("Task started");
          router.push("/");
        },
        onError: () => toast("Failed to start task", "error"),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Smart Surface</h1>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        AI-recommended tasks based on priority, due dates, and context.
      </p>

      {isLoading && <Spinner className="py-12" />}

      {error && (
        <EmptyState
          title="Failed to load recommendations"
          description={error.message}
        />
      )}

      {recommendations && recommendations.length === 0 && (
        <EmptyState
          title="No recommendations"
          description="All caught up! Check back later."
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          }
        />
      )}

      <div className="space-y-3">
        {recommendations?.map((rec, i) => (
          <Card key={rec.taskId ?? i}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">
                  {rec.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{rec.reason}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="priority" value={rec.priority} />
                  <span className="text-xs text-gray-400">{rec.source}</span>
                </div>
              </div>
              {rec.taskId && (
                <Button
                  size="sm"
                  onClick={() => handleStart(rec.taskId!)}
                  loading={updateTask.isPending}
                >
                  Start
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
