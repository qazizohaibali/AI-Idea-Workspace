"use client";

import React, { useEffect, useRef, useState } from "react";
import { AiFillOpenAI } from "react-icons/ai";
import { FaUser } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RiSendPlaneFill } from "react-icons/ri";
import Spinner from "./Spinner";
import { Message } from "@/types";
import { GetRequest } from "@/app/useRequest";

export default function ChatBox({ ideaId }: { ideaId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await GetRequest(`/api/ideas/${ideaId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? data);
    } catch (err) {
      console.error("fetchMessages error:", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: `local-${Date.now()}`,
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((s) => [...s, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/ideas/${ideaId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: userMsg.content }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.assistantMessage) {
          setMessages((s) => [...s, { ...data.assistantMessage }]);
        } else if (data.messages) {
          setMessages(data.messages);
        } else if (data.assistant) {
          setMessages((s) => [
            ...s,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              content: data.assistant,
            },
          ]);
        } else {
          setMessages((s) => [
            ...s,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              content: "Thanks — I can help break this down. (Demo reply)",
            },
          ]);
        }
      } else {
        setTimeout(() => {
          setMessages((s) => [
            ...s,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              content:
                "Demo: I suggest starting with research, then prototyping.",
            },
          ]);
        }, 700);
      }
    } catch (err) {
      setTimeout(() => {
        setMessages((s) => [
          ...s,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: "Demo: looks great — I can help draft tasks.",
          },
        ]);
      }, 700);
    } finally {
      setSending(false);
    }
  };

  function RenderMarkdown({ text, isUser }: { text: string; isUser: boolean }) {
    const baseTextClass = isUser ? "text-white" : "text-gray-800";
    const linkClass = isUser
      ? "underline text-white/90"
      : "underline text-indigo-600";
    const codeBg = isUser
      ? "bg-white/10 text-white"
      : "bg-gray-100 text-gray-800";
    return (
      <ReactMarkdown
        children={text}
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className={`text-lg font-semibold mt-2 mb-1 ${baseTextClass}`}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className={`text-base font-semibold mt-2 mb-1 ${baseTextClass}`}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className={`text-sm font-semibold mt-2 mb-1 ${baseTextClass}`}
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className={`text-sm leading-6 ${baseTextClass} break-words`}
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className={`list-disc pl-5 mt-1 mb-1 ${baseTextClass}`}
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className={`list-decimal pl-5 mt-1 mb-1 ${baseTextClass}`}
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className={`mb-1 ${baseTextClass}`} {...props} />
          ),
          table: ({ node, ...props }) => (
            <table className="w-full text-sm border-collapse" {...props} />
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50" {...props} />
          ),
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => <tr className="border-t" {...props} />,
          th: ({ node, ...props }) => (
            <th
              className={`text-left py-2 px-3 text-xs font-semibold ${baseTextClass}`}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className={`py-2 px-3 align-top ${baseTextClass}`} {...props} />
          ),
          code: ({
            node,
            inline,
            ...props
          }: {
            node?: any;
            inline?: boolean;
            [key: string]: any;
          }) =>
            inline ? (
              <code
                className={`px-1 rounded text-sm ${codeBg} ${
                  isUser ? "text-white" : "text-gray-800"
                }`}
                {...props}
              />
            ) : (
              <pre
                className={`rounded-md p-3 overflow-auto ${
                  isUser ? "bg-white/8" : "bg-gray-100"
                }`}
              >
                <code {...props} />
              </pre>
            ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className={`pl-4 border-l-2 italic ${
                isUser
                  ? "border-white/30 text-white/85"
                  : "border-gray-200 text-gray-700"
              }`}
              {...props}
            />
          ),
          a: ({ node, ...props }) => <a className={linkClass} {...props} />,
          strong: ({ node, ...props }) => (
            <strong className={baseTextClass} {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className={baseTextClass} {...props} />
          ),
        }}
      />
    );
  }

  useEffect(() => {
    fetchMessages();
  }, [ideaId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto space-y-4 px-1">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              {/* <svg
                className="mx-auto mb-3"
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2v2"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 6l-2 2"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6l2 2"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22v-2"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
              <div className="flex items-center justify-center mb-4">
                {" "}
                <AiFillOpenAI size={40} className="opacity-90" />
              </div>
              <div className="text-lg font-medium">
                Start a conversation with the AI assistant
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Ask questions or ask to generate a task breakdown.
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            const bubbleClass = isUser
              ? "ml-auto bg-[#7C3BED] text-white"
              : "bg-white border border-gray-200 text-gray-800 shadow-sm";

            return (
              <div key={m.id} className="flex items-start w-full">
                {m.role === "assistant" ? (
                  <>
                    <div className="mr-3 mt-1">
                      <div className="w-10 h-10 rounded-full bg-gray-50 border flex items-center justify-center text-gray-600">
                        <AiFillOpenAI size={20} />
                      </div>
                    </div>

                    <div
                      className={`max-w-[82%] rounded-xl px-5 py-4 ${bubbleClass}`}
                    >
                      <div className="prose max-w-none">
                        <RenderMarkdown text={m.content} isUser={false} />
                      </div>
                      <div className="text-xs text-gray-400 mt-3">
                        Assistant
                      </div>
                    </div>

                    <div className="flex-1" />
                  </>
                ) : (
                  <>
                    <div className="flex-1" />
                    <div
                      className={`max-w-[82%] rounded-xl px-5 py-3 ${bubbleClass}`}
                    >
                      <div className="max-w-none">
                        <RenderMarkdown text={m.content} isUser={true} />
                      </div>
                    </div>
                    <div className="ml-3 mt-1">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                        <FaUser size={18} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex gap-3 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-200 px-4 py-3 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-[#7C3BED] text-white px-4 py-3 rounded-lg disabled:opacity-90"
          >
            {sending ? (
              <div className="flex gap-2">
                <Spinner />
              </div>
            ) : (
              <RiSendPlaneFill size={23} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
