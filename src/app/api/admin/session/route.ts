import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";

// GET /api/admin/session — verifica si la sesión de admin está activa
export async function GET() {
  try {
    const authed = await isAdminAuthed();
    return NextResponse.json({ authed });
  } catch (e) {
    console.error("[admin/session] error", e);
    return NextResponse.json({ authed: false }, { status: 500 });
  }
}
