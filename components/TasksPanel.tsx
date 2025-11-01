"use client";

import React, { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  description?: string;
  priority?: number;
  status?: string;
};

export default function TasksPanel({ ideaId }: { ideaId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/ideas/${ideaId}/generate-tasks`);
        if (!res.ok) return;
        const data = await res.json();
        console.log("Fetched existing tasks:", data);
        setTasks(data.tasks ?? data);
      } catch (err) {
      }
    })();
  }, [ideaId]);

  const generateSampleTasks = (title = "Task Group"): Task[] => {
    return [
      {
        id: `t-${Date.now()}-1`,
        title: `Research & validate "${title}"`,
        description: "Market research, competitors, requirements",
        priority: 1,
        status: "todo",
      },
      {
        id: `t-${Date.now()}-2`,
        title: "Create prototype",
        description: "Sketches / wireframes / MVP",
        priority: 2,
        status: "todo",
      },
      {
        id: `t-${Date.now()}-3`,
        title: "User testing & feedback",
        description: "Collect feedback and iterate",
        priority: 3,
        status: "todo",
      },
    ];
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ideas/${ideaId}/generate-tasks`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tasks) {
          setTasks(data.tasks);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      setTasks(generateSampleTasks());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div>
        <h3 className="text-lg font-semibold">Tasks</h3>
        <p className="text-sm text-gray-500 mt-1">
          AI-generated task breakdown
        </p>
      </div>

      <div className="mt-4">
        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 border rounded-lg px-4 py-3 text-white bg-gray-950 hover:bg-gray-900 cursor-pointer"
        >
          {/* <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80"><path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> */}
          {loading ? "Generating..." : "Generate Task Breakdown"}
        </button>
      </div>

      <div className="flex-1 mt-6 overflow-auto">
        {tasks.length === 0 ? (
          <div className="text-gray-500">
            No tasks yet. Generate a task breakdown to get started.
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((t) => (
              <li key={t.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-semibold">{t.title}</h4>
                    {t.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    P{t.priority ?? 3}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
