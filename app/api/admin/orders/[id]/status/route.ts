import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { updateOrderStatus } from "@/server/queries/orders";
import { sendOrderStatusEmail } from "@/lib/email";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    status?: string;
  } | null;

  if (!body?.status) {
    return NextResponse.json({ error: "status es requerido" }, { status: 400 });
  }

  const { id } = await context.params;
  const order = await updateOrderStatus(id, body.status);
  await sendOrderStatusEmail(order, body.status.replaceAll("_", " "));

  return NextResponse.json({ order });
}

