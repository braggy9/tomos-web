"use client";

import { useLifeToday } from "../../hooks/useLifeToday";
import { HabitRow } from "../../components/HabitRow";
import { PriorityCard } from "../../components/PriorityCard";
import { useLogHabit } from "../../hooks/useHabits";
import { Spinner } from "@tomos/ui";

const moodEmoji: Record<string, string> = {
  great: "\uD83D\uDE04",
  good: "\uD83D\uDE0A",
  okay: "\uD83D\uDE10",
  low: "\uD83D\uDE14",
  rough: "\uD83D\uDE1E",
};

export default function TodayPage() {
  const { data, isLoading } = useLifeToday();
  const logHabit = useLogHabit();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  const todayISO = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });

  function handleToggleHabit(habitId: string, completed: boolean) {
    logHabit.mutate({ id: habitId, date: todayISO, completed });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{data.dayOfWeek}</h1>
        <p className="text-sm text-gray-500">{new Date(data.date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-2xl font-bold text-brand-600">
            {data.habits.completed}/{data.habits.total}
          </p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Habits</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-2xl font-bold text-brand-600">
            {data.shopping.uncheckedCount}
          </p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">To buy</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-2xl font-bold text-brand-600">
            {data.tasks.length}
          </p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Open tasks</p>
        </div>
      </div>

      {/* Habits checklist */}
      {data.habits.total > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Today&apos;s Habits
          </h2>
          <div className="space-y-2">
            {data.habits.items.map((item) => (
              <HabitRow
                key={item.habit.id}
                id={item.habit.id}
                title={item.habit.title}
                icon={item.habit.icon}
                streak={item.streak}
                completedToday={item.completedToday}
                onToggle={handleToggleHabit}
              />
            ))}
          </div>
        </section>
      )}

      {/* Weekly priorities */}
      {data.plan?.priorities && data.plan.priorities.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            This Week&apos;s Priorities
          </h2>
          <div className="space-y-2">
            {data.plan.priorities.map((p, i) => (
              <PriorityCard
                key={i}
                title={p.title}
                category={p.category}
                status={p.status}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top tasks */}
      {data.tasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Top Tasks
          </h2>
          <div className="space-y-2">
            {data.tasks.slice(0, 5).map((task) => (
              <a
                key={task.id}
                href={`https://tomos-tasks.vercel.app/task/${task.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-100 hover:border-brand-200 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${
                  task.priority === "urgent" ? "bg-red-400" :
                  task.priority === "high" ? "bg-orange-400" :
                  task.priority === "medium" ? "bg-blue-400" : "bg-gray-300"
                }`} />
                <span className="flex-1 text-sm text-gray-800 truncate">{task.title}</span>
                {task.dueDate && (
                  <span className="text-[10px] text-gray-400">
                    {new Date(task.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Journal mood + training */}
      <div className="grid grid-cols-2 gap-3">
        {data.journal && (
          <a
            href="https://tomos-journal.vercel.app"
            className="bg-white rounded-xl border border-gray-100 p-3 hover:border-brand-200 transition-colors"
          >
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Mood</p>
            <p className="text-xl mt-1">
              {data.journal.mood ? moodEmoji[data.journal.mood] || data.journal.mood : "--"}
            </p>
          </a>
        )}
        {data.training?.prescription && (
          <a
            href="https://tomos-fitness.vercel.app"
            className="bg-white rounded-xl border border-gray-100 p-3 hover:border-brand-200 transition-colors"
          >
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Training</p>
            <p className="text-sm font-medium text-gray-700 mt-1 truncate">
              {data.training.prescription.sessionType || "Prescribed"}
            </p>
          </a>
        )}
      </div>
    </div>
  );
}
