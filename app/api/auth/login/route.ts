import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { setAuthCookie, verifyPassword } from "@/server/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  if (!body?.email || !body.password) {
    return NextResponse.json(
      { error: "Correo y contraseña son requeridos." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { email: body.email.trim().toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash || !verifyPassword(body.password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Credenciales inválidas." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
  setAuthCookie(response, user.id);
  return response;
}

