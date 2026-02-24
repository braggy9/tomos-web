"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTasks, useTask, useUpdateTask, useCompleteTask, useCreateSubtask } from "../../hooks/useTasks";
import { Button, Badge, Spinner } from "@tomos/ui";
import { useToast } from "@tomos/ui";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { data: tasks, isLoading } = useTasks();
  const { data: taskDetail } = useTask(id);
  const updateTask = useUpdateTask();
  const completeTask = useCompleteTask();
  const createSubtask = useCreateSubtask();

  const task = tasks?.find((t) => t.id === id);
  const subtasks = taskDetail?.subtasks ?? [];

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [newSubtask, setNewSubtask] = useState("");

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

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    createSubtask.mutate(
      { parentId: task.id, taskText: newSubtask.trim() },
      {
        onSuccess: () => {
          toast("Subtask added");
          setNewSubtask("");
        },
        onError: () => toast("Failed to add subtask", "error"),
      }
    );
  };

  const handleCompleteSubtask = (subtaskId: string) => {
    completeTask.mutate(subtaskId, {
      onSuccess: () => toast("Subtask completed"),
      onError: () => toast("Failed to complete subtask", "error"),
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

      {/* Subtasks */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Subtasks</h3>
          {subtasks.length > 0 && (
            <span className="text-xs text-gray-400">
              {subtasks.filter((s) => s.status.toLowerCase() === "done").length}/{subtasks.length} done
            </span>
          )}
        </div>

        {subtasks.length > 0 && (
          <div className="divide-y divide-gray-50">
            {subtasks.map((sub) => {
              const subDone = sub.status.toLowerCase() === "done";
              return (
                <div key={sub.id} className="flex items-center gap-3 px-4 py-2.5">
                  <button
                    onClick={() => !subDone && handleCompleteSubtask(sub.id)}
                    disabled={subDone}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all ${
                      subDone
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 hover:border-violet-500 hover:bg-violet-50"
                    }`}
                    aria-label={subDone ? "Completed" : "Mark complete"}
                  >
                    {subDone && (
                      <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-sm ${subDone ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {sub.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick-add subtask */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
              placeholder="Add subtask..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddSubtask}
              loading={createSubtask.isPending}
              disabled={!newSubtask.trim()}
            >
              Add
            </Button>
          </div>
        </div>
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
