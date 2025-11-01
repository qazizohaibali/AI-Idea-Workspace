"use client";

import Link from "next/link";
import { Idea } from "@/types/idea";
import { MdDelete } from "react-icons/md";

interface IdeasCardsProps {
  ideas: Idea[];
  onDelete?: (id: string) => void;
}

export default function IdeasCards({ ideas, onDelete }: IdeasCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
      {ideas.map((idea) => (
        <Link
          href={`/ideas/${idea.id}`}
          key={idea.id}
          className="block bg-white rounded-2xl shadow p-6 border border-gray-200 hover:shadow-md"
          aria-label={`Open idea ${idea.title}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold mb-2">{idea.title}</h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();  // stop Link navigation when deleting
                e.stopPropagation();
                if (!idea.id) return;
                if (confirm("Delete this idea?")) onDelete?.(idea.id);
              }}
            >
              <MdDelete size={22} color="red" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">{idea.description}</p>
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
