"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostRequest } from "@/app/useRequest";
import toast, { Toaster } from "react-hot-toast";
import { LoginFormData } from "@/types";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      
      const res = await PostRequest("/api/auth/login", { ...formData });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
        toast.success("Logged in successfully");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Login failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white">
      <Toaster />
      <div className="w-[40%] mx-auto min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[450px] p-10 shadow-2xl rounded-2xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500 mb-8">
            Sign in to access your AI Idea Workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border text-black border-gray-200 px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Password"
                required
                className="w-full rounded-lg border text-black border-gray-200 px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-lg font-semibold hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-gray-500 text-sm">
            Dont have an account?{" "}
            <Link href="/signup" className="font-semibold text-gray-900">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
