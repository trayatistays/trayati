import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, validateAdminCredentials } from "@/lib/admin-auth";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8,
};

export async function GET() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get(ADMIN_COOKIE_NAME)?.value === "1";

  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!validateAdminCredentials(body.username ?? "", body.password ?? "")) {
    return NextResponse.json(
      { error: "Invalid admin credentials." },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "1", cookieOptions);
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    ...cookieOptions,
    maxAge: 0,
  });

  return NextResponse.json({ authenticated: false });
}
