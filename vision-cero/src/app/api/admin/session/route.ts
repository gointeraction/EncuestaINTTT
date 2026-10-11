import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAuthSessionCookie } from "@/lib/auth";

// GET /api/admin/session — verifica si la sesión de admin está activa
export async function GET() {
  try {
    const authed = await isAdminAuthed();
    if (authed) {
      await createAuthSessionCookie({
        id: "admin-master",
        email: "admin@intt.gob.ve",
        role: "admin",
      });
    }
    return NextResponse.json({ authed });
  } catch (e) {
    console.error("[admin/session] error", e);
    return NextResponse.json({ authed: false }, { status: 500 });
  }
}
