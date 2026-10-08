import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, createAdminSession } from "@/lib/admin-auth";
import { createAuthSessionCookie } from "@/lib/auth";

// POST /api/admin/login — autenticar administrador
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (typeof password !== "string" || !password) {
      return NextResponse.json(
        { error: "Contraseña requerida" },
        { status: 400 }
      );
    }
    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }
    await createAdminSession();
    await createAuthSessionCookie({
      id: "admin-master",
      email: "admin@intt.gob.ve",
      role: "admin",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/login] error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
