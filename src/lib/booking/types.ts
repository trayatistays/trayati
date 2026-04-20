export type DateRange = {
  startDate: string;
  endDate: string;
};

export type BookingSource = {
  id: string;
  stayId: string;
  roomId: string | null;
  providerName: string;
  feedUrl: string;
  isActive: boolean;
  lastSyncedAt: string | null;
  lastSyncStatus: "never" | "success" | "failed";
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingLock = {
  id: string;
  stayId: string;
  roomId: string | null;
  sessionId: string;
  startDate: string;
  endDate: string;
  expiresAt: string;
};

export type GuestDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
};

export type BookingRecord = {
  id: string;
  userId: string;
  stayId: string;
  roomId: string | null;
  startDate: string;
  endDate: string;
  status: "pending" | "confirmed" | "failed" | "cancelled";
  paymentId: string | null;
  paymentOrderId: string | null;
  currency: string;
  amount: number | null;
  lockId: string | null;
  guestDetails?: GuestDetails;
  promoCodeId?: string | null;
  discountAmount?: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type BlockedDateRecord = {
  id: string;
  stayId: string;
  roomId: string | null;
  startDate: string;
  endDate: string;
  source: "ical" | "local";
  bookingId: string | null;
  bookingSourceId: string | null;
  externalUid: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AvailabilityResponse = {
  stayId: string;
  roomId: string | null;
  startDate: string;
  endDate: string;
  unavailableDates: string[];
  blockedRanges: Array<
    DateRange & {
      source: "booking" | "blocked" | "lock";
      reason: string;
    }
  >;
  generatedAt: string;
  cacheTtlSeconds: number;
};
