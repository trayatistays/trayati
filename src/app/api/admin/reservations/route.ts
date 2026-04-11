import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getContentCollection } from "@/lib/content-data";
import { getAllStays } from "@/lib/stays-store";

export const dynamic = "force-dynamic";

type ReservationRecord = {
  id: string;
  clerkUserId: string;
  stayId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "requested" | "confirmed" | "cancelled";
  createdAt: string;
};

type EnrichedReservation = ReservationRecord & {
  userName: string;
  userEmail: string;
  propertyName: string;
};

type ClerkUserResponse = {
  first_name: string | null;
  last_name: string | null;
  email_addresses: { email_address: string }[];
};

function buildUserName(user: ClerkUserResponse | null) {
  if (!user) return "Unknown guest";
  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return name || "Unknown guest";
}

function buildUserEmail(user: ClerkUserResponse | null) {
  if (!user) return "";
  return user.email_addresses?.[0]?.email_address ?? "";
}

async function fetchClerkUser(userId: string, secret: string) {
  const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as ClerkUserResponse;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const reservations =
    (await getContentCollection("reservations")) as ReservationRecord[];
  const stays = await getAllStays();
  const stayMap = new Map(stays.map((stay) => [stay.id, stay.title]));

  const secret = process.env.CLERK_SECRET_KEY;
  const uniqueUserIds = Array.from(
    new Set(reservations.map((reservation) => reservation.clerkUserId)),
  );

  const userMap = new Map<string, ClerkUserResponse | null>();

  if (secret) {
    const results = await Promise.all(
      uniqueUserIds.map(async (userId) => [
        userId,
        await fetchClerkUser(userId, secret),
      ]),
    );
    for (const [userId, user] of results) {
      userMap.set(userId as string, user as ClerkUserResponse | null);
    }
  }

  const enriched: EnrichedReservation[] = reservations.map((reservation) => {
    const user = userMap.get(reservation.clerkUserId) ?? null;
    return {
      ...reservation,
      userName: buildUserName(user),
      userEmail: buildUserEmail(user),
      propertyName:
        stayMap.get(reservation.stayId) ?? reservation.stayId ?? "Unknown",
    };
  });

  return NextResponse.json({ reservations: enriched });
}
