import "server-only";
import { requireSupabaseAdmin } from "@/lib/supabase-admin";
import type { Invoice } from "@/lib/types";
import type { BookingRecord } from "@/lib/booking/types";
import type { FeaturedStay } from "@/data/featured-stays";

function toCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return result as T;
}

function generateInvoiceNumber(): string {
  const prefix = "INV";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function createInvoice(input: {
  booking: BookingRecord;
  stay: FeaturedStay;
  roomName?: string;
  pricing: {
    baseAmount: number;
    cleaningFee: number;
    serviceFee: number;
    gstAmount: number;
    discountAmount: number;
    totalAmount: number;
  };
  promoCode?: string;
  paymentId: string;
}): Promise<Invoice> {
  const supabase = requireSupabaseAdmin();
  
  const invoiceNumber = generateInvoiceNumber();
  const nights = Math.ceil(
    (new Date(input.booking.endDate).getTime() - new Date(input.booking.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      booking_id: input.booking.id,
      user_id: input.booking.userId,
      stay_id: input.booking.stayId,
      guest_name: input.booking.guestDetails
        ? `${input.booking.guestDetails.firstName} ${input.booking.guestDetails.lastName}`
        : "Guest",
      guest_email: input.booking.guestDetails?.email ?? "",
      guest_phone: input.booking.guestDetails?.phone ?? null,
      stay_name: input.stay.title,
      check_in: input.booking.startDate,
      check_out: input.booking.endDate,
      nights,
      guests: (input.booking.metadata?.guests as number) ?? 1,
      room_name: input.roomName ?? null,
      base_amount: input.pricing.baseAmount,
      cleaning_fee: input.pricing.cleaningFee,
      service_fee: input.pricing.serviceFee,
      gst_amount: input.pricing.gstAmount,
      discount_code: input.promoCode ?? null,
      discount_amount: input.pricing.discountAmount,
      total_amount: input.pricing.totalAmount,
      payment_id: input.paymentId,
      payment_method: "razorpay",
      payment_status: "paid",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create invoice: ${error.message}`);
  }

  return toCamelCase<Invoice>(data as Record<string, unknown>);
}

export async function getInvoiceByBookingId(bookingId: string): Promise<Invoice | null> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get invoice: ${error.message}`);
  }

  return data ? toCamelCase<Invoice>(data as Record<string, unknown>) : null;
}

export async function getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("invoice_number", invoiceNumber)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get invoice: ${error.message}`);
  }

  return data ? toCamelCase<Invoice>(data as Record<string, unknown>) : null;
}

export function generateInvoiceHtml(invoice: Invoice): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #2d3436; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #4a6544; }
    .logo { font-size: 24px; font-weight: 700; color: #4a6544; }
    .logo span { color: #a46c2b; }
    .invoice-info { text-align: right; }
    .invoice-title { font-size: 28px; font-weight: 700; color: #4a6544; margin-bottom: 8px; }
    .invoice-number { font-size: 14px; color: #636e72; }
    .invoice-date { font-size: 12px; color: #636e72; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .party { width: 48%; }
    .party-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; margin-bottom: 8px; }
    .party-name { font-weight: 600; font-size: 14px; }
    .party-detail { font-size: 12px; color: #636e72; }
    .booking-details { background: #f5f1e9; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
    .booking-title { font-size: 16px; font-weight: 600; color: #4a6544; margin-bottom: 12px; }
    .booking-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .booking-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #636e72; }
    .booking-item .value { font-weight: 600; font-size: 14px; margin-top: 4px; }
    .line-items { margin-bottom: 30px; }
    .line-items table { width: 100%; border-collapse: collapse; }
    .line-items th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; padding: 12px 0; border-bottom: 1px solid #dfe6e9; }
    .line-items td { padding: 12px 0; border-bottom: 1px solid #f5f1e9; }
    .line-items .amount { text-align: right; }
    .line-items .total-row td { border-bottom: none; font-weight: 600; font-size: 16px; color: #4a6544; }
    .line-items .total-row .amount { font-size: 18px; }
    .discount-row { color: #00b894; }
    .summary { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .payment-info { width: 48%; }
    .payment-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #636e72; margin-bottom: 8px; }
    .payment-detail { font-size: 12px; }
    .terms { background: #f5f1e9; border-radius: 8px; padding: 16px; margin-bottom: 30px; }
    .terms-title { font-weight: 600; margin-bottom: 8px; }
    .terms-list { font-size: 11px; color: #636e72; padding-left: 16px; }
    .terms-list li { margin-bottom: 4px; }
    .footer { text-align: center; color: #636e72; font-size: 11px; padding-top: 20px; border-top: 1px solid #dfe6e9; }
    .footer a { color: #4a6544; text-decoration: none; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Trayati <span>Stays</span></div>
      <div class="invoice-info">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
        <div class="invoice-date">Issued: ${new Date(invoice.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="party-label">Billed To</div>
        <div class="party-name">${invoice.guestName}</div>
        <div class="party-detail">${invoice.guestEmail}</div>
        ${invoice.guestPhone ? `<div class="party-detail">${invoice.guestPhone}</div>` : ""}
      </div>
      <div class="party">
        <div class="party-label">Property</div>
        <div class="party-name">${invoice.stayName}</div>
        <div class="party-detail">Trayati Stays</div>
        <div class="party-detail">support@trayati.com</div>
      </div>
    </div>

    <div class="booking-details">
      <div class="booking-title">Booking Details</div>
      <div class="booking-grid">
        <div class="booking-item">
          <label>Check-in</label>
          <div class="value">${new Date(invoice.checkIn).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
        </div>
        <div class="booking-item">
          <label>Check-out</label>
          <div class="value">${new Date(invoice.checkOut).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
        </div>
        <div class="booking-item">
          <label>Duration</label>
          <div class="value">${invoice.nights} night${invoice.nights > 1 ? "s" : ""}</div>
        </div>
        <div class="booking-item">
          <label>Guests</label>
          <div class="value">${invoice.guests}</div>
        </div>
      </div>
      ${invoice.roomName ? `<div style="margin-top: 12px; font-size: 12px; color: #636e72;">Room: ${invoice.roomName}</div>` : ""}
    </div>

    <div class="line-items">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Accommodation (${invoice.nights} night${invoice.nights > 1 ? "s" : ""})</td>
            <td class="amount">₹${invoice.baseAmount.toLocaleString()}</td>
          </tr>
          ${invoice.cleaningFee > 0 ? `
          <tr>
            <td>Cleaning Fee</td>
            <td class="amount">₹${invoice.cleaningFee.toLocaleString()}</td>
          </tr>
          ` : ""}
          ${invoice.serviceFee > 0 ? `
          <tr>
            <td>Service Fee</td>
            <td class="amount">₹${invoice.serviceFee.toLocaleString()}</td>
          </tr>
          ` : ""}
          ${invoice.gstAmount > 0 ? `
          <tr>
            <td>GST (18%)</td>
            <td class="amount">₹${invoice.gstAmount.toLocaleString()}</td>
          </tr>
          ` : ""}
          ${invoice.discountAmount > 0 ? `
          <tr class="discount-row">
            <td>Discount${invoice.discountCode ? ` (${invoice.discountCode})` : ""}</td>
            <td class="amount">-₹${invoice.discountAmount.toLocaleString()}</td>
          </tr>
          ` : ""}
          <tr class="total-row">
            <td>Total Amount Paid</td>
            <td class="amount">₹${invoice.totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="summary">
      <div class="payment-info">
        <div class="payment-label">Payment Information</div>
        <div class="payment-detail">Payment ID: ${invoice.paymentId ?? "N/A"}</div>
        <div class="payment-detail">Payment Method: ${invoice.paymentMethod ?? "Razorpay"}</div>
        <div class="payment-detail">Status: ${invoice.paymentStatus === "paid" ? "Paid" : invoice.paymentStatus}</div>
      </div>
    </div>

    <div class="terms">
      <div class="terms-title">Terms & Conditions</div>
      <ul class="terms-list">
        <li>Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
        <li>Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable.</li>
        <li>Valid ID proof required at check-in.</li>
        <li>This is a computer-generated invoice and does not require a signature.</li>
      </ul>
    </div>

    <div class="footer">
      <p>Thank you for choosing Trayati Stays!</p>
      <p style="margin-top: 8px;">
        <a href="https://trayati.com">www.trayati.com</a> | 
        support@trayati.com | 
        +91-XXXXXXXXXX
      </p>
      <p style="margin-top: 12px; color: #b2bec3;">© ${new Date().getFullYear()} Trayati Stays. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateInvoiceText(invoice: Invoice): string {
  const divider = "═".repeat(50);
  const line = "─".repeat(50);
  
  return `
${divider}
                    TRAYATI STAYS
                      INVOICE
${divider}

Invoice Number: ${invoice.invoiceNumber}
Issued: ${new Date(invoice.issuedAt).toLocaleDateString("en-IN")}

${line}

BILLED TO:
  ${invoice.guestName}
  ${invoice.guestEmail}
  ${invoice.guestPhone ?? ""}

${line}

BOOKING DETAILS:
  Property: ${invoice.stayName}
  Check-in: ${new Date(invoice.checkIn).toLocaleDateString("en-IN")}
  Check-out: ${new Date(invoice.checkOut).toLocaleDateString("en-IN")}
  Duration: ${invoice.nights} night${invoice.nights > 1 ? "s" : ""}
  Guests: ${invoice.guests}
  ${invoice.roomName ? `Room: ${invoice.roomName}` : ""}

${line}

CHARGES:
  Accommodation (${invoice.nights} nights)      ₹${invoice.baseAmount.toLocaleString()}
  ${invoice.cleaningFee > 0 ? `Cleaning Fee                    ₹${invoice.cleaningFee.toLocaleString()}` : ""}
  ${invoice.serviceFee > 0 ? `Service Fee                     ₹${invoice.serviceFee.toLocaleString()}` : ""}
  ${invoice.gstAmount > 0 ? `GST (18%)                       ₹${invoice.gstAmount.toLocaleString()}` : ""}
  ${invoice.discountAmount > 0 ? `Discount${invoice.discountCode ? ` (${invoice.discountCode})` : ""}                  -₹${invoice.discountAmount.toLocaleString()}` : ""}
${line}
  TOTAL AMOUNT PAID               ₹${invoice.totalAmount.toLocaleString()}
${divider}

PAYMENT INFO:
  Payment ID: ${invoice.paymentId ?? "N/A"}
  Payment Method: ${invoice.paymentMethod ?? "Razorpay"}
  Status: ${invoice.paymentStatus === "paid" ? "Paid" : invoice.paymentStatus}

${line}

TERMS & CONDITIONS:
  • Check-in: 2:00 PM | Check-out: 11:00 AM
  • Free cancellation up to 48 hours before check-in
  • Valid ID proof required at check-in

${divider}

Thank you for choosing Trayati Stays!
www.trayati.com | support@trayati.com

© ${new Date().getFullYear()} Trayati Stays. All rights reserved.
`.trim();
}
