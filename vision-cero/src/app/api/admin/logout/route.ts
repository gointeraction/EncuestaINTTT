import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/admin-auth";
import { destroyAuthSessionCookie } from "@/lib/auth";

// POST /api/admin/logout — cerrar sesión de administrador
export async function POST() {
  try {
    await destroyAdminSession();
    await destroyAuthSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/logout] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
