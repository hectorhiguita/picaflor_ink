import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { hashPassword, setAuthCookie } from "@/server/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
  } | null;

  if (!body?.email || !body.password || body.password.length < 8) {
    return NextResponse.json(
      { error: "Correo y contraseña de mínimo 8 caracteres son requeridos." },
      { status: 400 }
    );
  }

  const email = body.email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json(
      { error: "El correo ya está en uso." },
      { status: 409 }
    );
  }

  const user = await db.user.create({
    data: {
      email,
      name: body.name?.trim() || null,
      passwordHash: hashPassword(body.password),
      profile: { create: {} },
    },
    select: { id: true, email: true, name: true, role: true },
  });

  const response = NextResponse.json({ user }, { status: 201 });
  setAuthCookie(response, user.id);
  return response;
}

