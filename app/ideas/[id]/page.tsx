"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GoArrowLeft } from "react-icons/go";
import ChatBox from "@/components/ChatBox";
import TasksPanel from "@/components/TasksPanel";

type Idea = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
};

export default function IdeaPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    const fetchIdea = async () => {
      try {
        const res = await fetch(`/api/ideas/${id}`);
        if (!res.ok) throw new Error("Failed to fetch idea");
        const data = await res.json();
        setIdea(data.idea ?? data);
      } catch (err) {
        console.error("fetchIdea error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIdea();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F9FAFC] p-6">
      <div className="max-w-[1400px] mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 px-3 py-2 bg-white rounded-md shadow-sm text-sm font-medium"
        >
          <GoArrowLeft /> Back to Ideas
        </Link>

        {loading ? (
          <div className="py-20 text-center text-gray-600">Loading...</div>
        ) : !idea ? (
          <div className="py-20 text-center text-red-600">Idea not found</div>
        ) : (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold">{idea.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{idea.description}</p>
            </header>

            <div className="grid grid-cols-12 gap-6">
              {/* Chat / AI Assistant (left) */}
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-white rounded-2xl shadow border border-gray-200 h-[72vh] flex flex-col">
                  <div className="px-6 py-5 border-b">
                    <h2 className="text-lg font-semibold">AI Assistant</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Chat with AI to refine and develop your idea
                    </p>
                  </div>

                  <div className="flex-1 overflow-auto p-6">
                    <ChatBox ideaId={idea.id} />
                  </div>
                </div>
              </div>

              {/* Tasks (right) */}
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 h-[72vh] flex flex-col">
                  <TasksPanel ideaId={idea.id} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
