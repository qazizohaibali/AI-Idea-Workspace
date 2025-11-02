"use client";

import { useEffect, useState } from "react";
import { FaRegLightbulb } from "react-icons/fa";
import { PiSignOutFill } from "react-icons/pi";
import IdeaForm from "@/components/IdeaForm";
import IdeasCards from "@/components/IdeasCards";
import { Idea } from "@/types/idea";
import toast, { Toaster } from "react-hot-toast";
import { DeleteRequest, GetRequest } from "./useRequest";
import Spinner from "@/components/Spinner";
import userStore from "@/store/user.store";
import { redirect } from "next/navigation";

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { loginUser } = userStore();

  const fetchIdeas = async () => {
    try {
      const res = await GetRequest("/api/ideas");

      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      } else {
        const err = await res.json();
        console.log(err.message || "Failed to fetch ideas");
      }
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  async function handleDelete(id: string) {
    try {
      const res = await DeleteRequest(`/api/ideas`, { id });

      if (res.ok) {
        setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== id));
        toast.success("Idea deleted successfully");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to delete idea");
      }
    } catch (error) {
      console.error("Error deleting idea:", error);
    }
  }

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  if (!loginUser) {
    redirect("/login");
  }

  return (
    <div className="bg-[#FAFBFD] min-h-screen">
      <Toaster />
      <div className="flex justify-between items-center p-4 lg:p-5 shadow border-b border-gray-300">
        <div className="flex items-center gap-1">
          <FaRegLightbulb size={30} color="#7C3BED" />
          <p className="text-xl lg:text-2xl font-semibold">AI Idea WorkSpace</p>
        </div>
        <button
          onClick={handleLogOut}
          className="flex items-center justify-center gap-1 cursor-pointer"
        >
          <PiSignOutFill size={20} />
          <p className="font-semibold text-sm lg:text-base">Log Out</p>
        </button>
      </div>

      <div className="px-10">
        <div className="flex lg:flex-row flex-col lg:items-center gap-4 lg:gap-0 justify-between py-10">
          <div>
            <p className="text-[30px] lg:text-[40px] font-bold">Your Ideas</p>
            <p className="text-lg lg:text-xl opacity-50">
              Create and manage your project ideas with AI assistance
            </p>
          </div>
          <IdeaForm buttonTitle="New Idea" fetchIdeas={fetchIdeas} />
        </div>

        {loading ? (
          // <p className="text-gray-500 text-center py-10">Loading ideas...</p>
          <div className="h-[300px] w-full flex items-center justify-center">
            {" "}
            <Spinner />
          </div>
        ) : ideas.length === 0 ? (
          <div className="bg-white py-10 h-[400px] rounded-3xl border border-gray-200 flex flex-col items-center justify-center">
            <FaRegLightbulb size={50} color="#999999" />
            <p className="text-2xl py-1 font-semibold">No ideas yet</p>
            <p className="py-2 font-normal opacity-50">
              Create your first idea to get started
            </p>
            <IdeaForm buttonTitle="Create Idea" fetchIdeas={fetchIdeas} />
          </div>
        ) : (
          <IdeasCards ideas={ideas} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
