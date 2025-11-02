"use client";

import { GetRequest, PostRequest } from "@/app/useRequest";
import { Task } from "@/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Spinner from "./Spinner";

export default function TasksPanel({ ideaId }: { ideaId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingToGetTasks, setLoadingToGetTasks] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoadingToGetTasks(true);
      const res = await GetRequest(`/api/ideas/${ideaId}/generate-tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? data);
      } else {
        console.error("Error fetching tasks");
      }
    } catch (err) {
      console.error("fetchTasks error:", err);
    } finally {
      setLoadingToGetTasks(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await PostRequest(`/api/ideas/${ideaId}/generate-tasks`);

      if (res.ok) {
        const data = await res.json();
        if (data.tasks) {
          setTasks(data.tasks);
          setLoading(false);
          toast.success("Tasks generated successfully");
        }
      }
    } catch (err) {
      console.log("err", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [ideaId]);

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
          {loading ? "Generating..." : "Generate Task Breakdown"}
        </button>
      </div>

      <div className="flex-1 mt-6 overflow-auto">
        {loadingToGetTasks ? (
          <div className="h-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : tasks.length === 0 ? (
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
