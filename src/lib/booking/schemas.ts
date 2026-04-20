import { z } from "zod";
import { differenceInDays } from "@/lib/booking/date";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.");

export const dateRangeSchema = z.object({
  startDate: isoDate,
  endDate: isoDate,
}).superRefine((value, ctx) => {
  if (differenceInDays(value.startDate, value.endDate) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "Check-out must be after check-in.",
    });
  }
});

export const availabilityQuerySchema = z.object({
  stayId: z.string().trim().min(1),
  roomId: z.string().trim().min(1).optional().nullable().transform(v => v || null),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
}).transform(data => ({
  ...data,
  roomId: data.roomId && data.roomId.length > 0 ? data.roomId : null,
}));

export const checkAvailabilitySchema = z.object({
  stayId: z.string().trim().min(1),
  roomId: z.string().trim().min(1).optional().nullable().transform(v => v || null),
  startDate: isoDate,
  endDate: isoDate,
}).transform(data => ({
  ...data,
  roomId: data.roomId && data.roomId.length > 0 ? data.roomId : null,
}));

export const createLockSchema = checkAvailabilitySchema.extend({
  sessionId: z.string().trim().min(8),
});

const guestDetailsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  specialRequests: z.string().trim().max(500).optional(),
});

export const createBookingSchema = z.object({
  stayId: z.string().trim().min(1),
  roomId: z.string().trim().min(1).optional().nullable(),
  startDate: isoDate,
  endDate: isoDate,
  guests: z.coerce.number().int().min(1).max(20),
  lockId: z.string().uuid(),
  sessionId: z.string().trim().min(8),
  guestDetails: guestDetailsSchema.optional(),
  promoCodeId: z.string().uuid().optional().nullable(),
  discountAmount: z.coerce.number().min(0).optional(),
});

export const createOrderSchema = z.object({
  bookingId: z.string().uuid(),
  sessionId: z.string().trim().min(8),
  amount: z.coerce.number().int().min(1).optional(),
  promoCodeId: z.string().uuid().optional().nullable(),
});

export const bookingSourceSchema = z.object({
  id: z.string().uuid().optional(),
  stayId: z.string().trim().min(1),
  roomId: z.string().trim().min(1).optional().nullable(),
  providerName: z.string().trim().min(1).max(120),
  feedUrl: z.url(),
  isActive: z.coerce.boolean().default(true),
});
