import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  const { email, name, password } = await req.json();

  console.log("Signup attempt:", { email, name });
  if (!email || !password) return NextResponse.json({ message: "Missing" }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ message: "User exists" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, name, hashedPassword: hashed } });

  return NextResponse.json({ ok: true });
}
