import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { callOpenRouterChat } from "@/app/lib/openrouter";

function extractFirstJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/(\[.*\]|\{.*\})/s);
    if (!match) throw new Error("No JSON found in model response");
    return JSON.parse(match[0]);
  }
}

// export async function POST(req: Request, { params }: { params: { id: string } }) {
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const ideaId = resolvedParams?.id;
  if (!ideaId)
    return NextResponse.json({ message: "Missing id" }, { status: 400 });

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea)
    return NextResponse.json({ message: "Idea not found" }, { status: 404 });

  const { numTasks = 5 } = (await request.json().catch(() => ({}))) ?? {};

  const system = `You are an assistant that returns ONLY valid JSON when asked.`;
  const userPrompt = `Given the idea below, return EXACTLY ${numTasks} tasks as a JSON array. Each task must be an object with keys:
- title (string)
- description (string)
- priority (integer 1-3)

Return ONLY the JSON array with no extra commentary.

Idea Title: ${idea.title}
Description: ${idea.description}

Example:
[
  { "title":"Research market", "description":"Do market research...", "priority":1 }
]`;

  try {
    const messages = [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ];

    const { raw, assistant } = await callOpenRouterChat(messages, {
      max_tokens: 1200,
      temperature: 0.2,
      model: process.env.OPENROUTER_MODEL,
    });

    const text =
      typeof assistant === "string"
        ? assistant
        : typeof raw === "string"
        ? raw
        : JSON.stringify(raw);
    let parsed: any;
    try {
      parsed = extractFirstJson(text);
    } catch (err) {
      console.error("Failed to parse JSON from model:", err, "raw:", text);
      return NextResponse.json(
        { message: "Failed to parse JSON from model" },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { message: "Model did not return an array" },
        { status: 500 }
      );
    }

    const tasksToCreate = parsed.slice(0, 50).map((t: any) => ({
      title: String(t.title ?? "Untitled"),
      description: String(t.description ?? ""),
      priority: Math.min(3, Math.max(1, Number(t.priority ?? 3))),
    }));

    const created = await Promise.all(
      tasksToCreate.map((t) =>
        prisma.task.create({
          data: {
            ideaId,
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: "todo",
          },
        })
      )
    );

    return NextResponse.json({ tasks: created, rawModel: raw });
  } catch (err: any) {
    console.error("generate-tasks error:", err);
    return NextResponse.json(
      { message: "Task generation failed", error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ await because params is a Promise

  console.log("Fetching tasks for idea with id:", id);

  if (!id) {
    return NextResponse.json(
      { error: "Missing id parameter" },
      { status: 400 }
    );
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { ideaId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
