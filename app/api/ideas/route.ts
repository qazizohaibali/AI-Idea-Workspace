import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const ideas = await prisma.idea.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json(
      { error: "Error fetching ideas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, tags } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        tags,
      },
    });

    return NextResponse.json({ idea }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error saving idea" }, { status: 500 });
  }
}

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const id = params.id;
//     const body = await req.json();
//     const { title, description, tags } = body;

//     if (!title || !description) {
//       return NextResponse.json({ message: "Missing fields" }, { status: 400 });
//     }

//     const updated = await prisma.idea.update({
//       where: { id },
//       data: {
//         title,
//         description,
//         tags,
//       },
//     });

//     return NextResponse.json({ idea: updated });
//   } catch (error) {
//     console.error("PUT /api/ideas/[id] error:", error);
//     return NextResponse.json(
//       { message: "Error updating idea" },
//       { status: 500 }
//     );
//   }
// }

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    console.log("----:Deleting idea with id:----", id);

    if (!id) {
      return NextResponse.json({ message: "Missing idea id" }, { status: 400 });
    }

    await prisma.message.deleteMany({
      where: { ideaId: id },
    });

    await prisma.task.deleteMany({
      where: { ideaId: id },
    });

    await prisma.idea.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/ideas error:", error);
    return NextResponse.json(
      { message: "Error deleting idea" },
      { status: 500 }
    );
  }
}
