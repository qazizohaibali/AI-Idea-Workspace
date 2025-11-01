import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { callOpenRouterChat } from "@/app/lib/openrouter";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: { ideaId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const ideaId = resolvedParams?.id;
  if (!ideaId) return NextResponse.json({ message: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { role, content } = body ?? {};
  if (!content || !role) return NextResponse.json({ message: "Missing role/content" }, { status: 400 });

  try {
    const userMsg = await prisma.message.create({
      data: {
        idea: { connect: { id: ideaId } },
        role,
        content,
      },
    });

    const history = await prisma.message.findMany({
      where: { ideaId },
      orderBy: { createdAt: "asc" },
      take: 30,
    });

    const messagesForModel = history.map((m) => ({
      role: m.role === "assistant" ? "assistant" : m.role === "user" ? "user" : "system",
      content: m.content,
    }));
    messagesForModel.push({ role: "user", content });

    const { raw, assistant } = await callOpenRouterChat(messagesForModel, {
      max_tokens: 800,
      temperature: 0.7,
      model: process.env.OPENROUTER_MODEL,
    });

    const assistantText = typeof assistant === "string" ? assistant : (typeof raw === "string" ? raw : JSON.stringify(raw));

    const assistantMsg = await prisma.message.create({
      data: {
        idea: { connect: { id: ideaId } },
        role: "assistant",
        content: assistantText,
      },
    });

    return NextResponse.json({ assistantMessage: assistantMsg });
  } catch (err: any) {
    console.error("POST /messages error:", err);
    return NextResponse.json({ message: "AI call failed", error: String(err?.message ?? err) }, { status: 500 });
  }
}

