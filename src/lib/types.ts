export type Host = {
  id: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankName: string | null;
  payoutMethod: string;
  status: "pending" | "approved" | "suspended" | "rejected";
  totalEarnings: number;
  totalPayouts: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StayHost = {
  id: string;
  stayId: string;
  hostId: string;
  ownershipPercentage: number;
  isPrimary: boolean;
  createdAt: string;
};

export type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minBookingAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableStayIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  bookingId: string;
  stayId: string;
  userId: string;
  rating: number;
  cleanlinessRating: number | null;
  locationRating: number | null;
  valueRating: number | null;
  title: string | null;
  comment: string | null;
  response: string | null;
  respondedAt: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Commission = {
  id: string;
  bookingId: string;
  stayId: string;
  hostId: string | null;
  grossAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  gstOnCommission: number;
  tds: number;
  netPayout: number;
  status: "pending" | "processed" | "paid" | "cancelled";
  payoutReference: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  userId: string;
  stayId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  stayName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  roomName: string | null;
  baseAmount: number;
  cleaningFee: number;
  serviceFee: number;
  gstAmount: number;
  discountCode: string | null;
  discountAmount: number;
  totalAmount: number;
  paymentId: string | null;
  paymentMethod: string | null;
  paymentStatus: string;
  issuedAt: string;
  createdAt: string;
};
