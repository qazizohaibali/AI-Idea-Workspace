import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    console.log("Signup attempt:", { email, name });
    if (!email || !password)
      return NextResponse.json({ message: "Missing" }, { status: 400 });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return NextResponse.json({ message: "User exists" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, name, hashedPassword: hashed },
    });
    console.log("User created:", user);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Server error", error: error },
      { status: 500 }
    );
  }
}
