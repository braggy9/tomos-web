"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTasks, useUpdateTask, useCompleteTask } from "../../hooks/useTasks";
import { Button, Badge, Spinner } from "@tomos/ui";
import { useToast } from "@tomos/ui";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const completeTask = useCompleteTask();

  const task = tasks?.find((t) => t.id === id);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority ?? "");
      setStatus(task.status);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    }
  }, [task]);

  if (isLoading) return <Spinner className="py-12" />;

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
        <Button variant="ghost" onClick={() => router.push("/")} className="mt-2">
          Back to tasks
        </Button>
      </div>
    );
  }

  const isDone = task.status === "Done";
  const hasChanges =
    title !== task.title ||
    priority !== (task.priority ?? "") ||
    status !== task.status ||
    dueDate !== (task.dueDate ? task.dueDate.slice(0, 10) : "");

  const handleSave = () => {
    const data: Record<string, string | null | undefined> = {};
    if (title !== task.title) data.title = title;
    if (priority !== (task.priority ?? "")) data.priority = priority;
    if (status !== task.status) data.status = status;
    if (dueDate !== (task.dueDate ? task.dueDate.slice(0, 10) : "")) {
      data.dueDate = dueDate || null;
    }

    updateTask.mutate(
      { id: task.id, data },
      {
        onSuccess: () => {
          toast("Task updated");
          router.push("/");
        },
        onError: () => toast("Failed to update task", "error"),
      }
    );
  };

  const handleComplete = () => {
    completeTask.mutate(task.id, {
      onSuccess: () => {
        toast("Task completed");
        router.push("/");
      },
      onError: () => toast("Failed to complete task", "error"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Edit Task</h1>
        <div className="flex items-center gap-2">
          {task.priority && <Badge variant="priority" value={task.priority} />}
          <Badge variant="status" value={task.status} />
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
          />
        </div>

        {/* Status + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            >
              <option value="Inbox">Inbox</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            >
              <option value="Urgent">Urgent</option>
              <option value="Important">Important</option>
              <option value="Someday">Someday</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
          />
        </div>

        {/* Context */}
        {task.context && task.context.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
            <div className="flex flex-wrap gap-1">
              {task.context.map((ctx) => (
                <Badge key={ctx} variant="context" value={ctx} />
              ))}
            </div>
          </div>
        )}

        {/* Energy + Time */}
        {(task.energy || task.time) && (
          <div className="flex gap-4 pt-2 border-t border-gray-100 text-xs text-gray-500">
            {task.energy && <span>Energy: {task.energy}</span>}
            {task.time && <span>Time: {task.time}</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          loading={updateTask.isPending}
          className="flex-1"
        >
          Save Changes
        </Button>
        {!isDone && (
          <Button
            variant="secondary"
            onClick={handleComplete}
            loading={completeTask.isPending}
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  );
}
