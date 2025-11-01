"use client";

import { useState, ChangeEvent } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import Modal from "./Modal";
import toast from "react-hot-toast";

interface IdeaFormProps {
  buttonTitle: string;
  fetchIdeas: () => void;
}

interface FormData {
  title: string;
  description: string;
  tags: string[];
}

export default function IdeaForm({ buttonTitle, fetchIdeas }: IdeaFormProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [addTag, setAddTag] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    tags: [],
  });

  const ideaGenerate = () => {
    setOpen(true);
    console.log("Button is Clicked");
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Failed to save idea:", data);
        toast.error("Failed to save idea");
        return;
      }

      toast.success("Idea saved successfully");
      setOpen(false);
      setFormData({ title: "", description: "", tags: [] });
      fetchIdeas();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={ideaGenerate}
        className="bg-[#7C3BED] text-white mt-4 px-5 py-3 text-base rounded-xl flex items-center gap-2 cursor-pointer hover:bg-[#6b2fcf] transition "
      >
        <HiOutlinePlus /> {buttonTitle}
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add Project Idea"
      >
        <p className="text-gray-600">Here you can add your project idea.</p>

        <div>
          <div className="my-4">
            <label className="block text-base font-semibold text-gray-700 mb-1">
              Title
            </label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter project title"
              required
              className="w-full rounded-lg border text-black border-gray-200 px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="my-4">
            <label className="block text-base font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter project description"
              required
              className="w-full rounded-lg border text-black border-gray-200 px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="">
            <div className="flex items-end gap-2">
              <div className="w-full">
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={addTag}
                  onChange={(e) => setAddTag(e.target.value)}
                  placeholder="Enter tag"
                  className="w-full rounded-lg border text-black border-gray-200 px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (addTag.trim() !== "") {
                    setFormData((prev) => ({
                      ...prev,
                      tags: [...prev.tags, addTag.trim()],
                    }));
                    setAddTag("");
                  }
                }}
                className="bg-[#7C3BED] text-white mt-4 px-5 py-[13px] rounded-xl font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#6b2fcf] transition "
              >
                <HiOutlinePlus size={18} /> Add
              </button>
            </div>

            <div className="border border-gray-200 mt-4 py-3 rounded-lg">
              <div>
                {formData.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 px-4">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 px-4">No tags added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="mt-6 text-right">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-[#7C3BED] text-white px-6 py-3 rounded-xl font-semibold cursor-pointer hover:bg-[#6b2fcf] transition "
            >
              Save Idea
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
