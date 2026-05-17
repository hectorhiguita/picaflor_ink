import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/constants";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Google OAuth no está configurado." },
      { status: 501 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${SITE_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}

