import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type BookingEmailData = {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  nights: number;
};

export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<boolean> {
  if (!resend) {
    console.warn("Resend not configured - skipping email send");
    return false;
  }

  try {
    await resend.emails.send({
      from: "Trayati Stays <bookings@trayati.com>",
      to: data.guestEmail,
      subject: `Booking Confirmed - ${data.propertyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #2d3436; margin: 0; padding: 0; background-color: #f5f1e9; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #4a6544 0%, #3d5338 100%); padding: 32px 40px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
            .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
            .content { padding: 40px; }
            .success-badge { display: inline-block; background: rgba(74,101,68,0.1); color: #4a6544; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 24px; }
            .greeting { font-size: 18px; margin-bottom: 24px; }
            .greeting strong { color: #4a6544; }
            .booking-details { background: #f5f1e9; border-radius: 12px; padding: 24px; margin: 24px 0; }
            .booking-details h3 { margin: 0 0 16px; font-size: 16px; color: #4a6544; }
            .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .detail-item { }
            .detail-item .label { font-size: 11px; color: #636e72; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .detail-item .value { font-size: 15px; font-weight: 600; }
            .property-name { font-size: 20px; font-weight: 700; color: #2d3436; margin: 0 0 8px; }
            .total-amount { text-align: center; padding: 24px; background: linear-gradient(135deg, rgba(74,101,68,0.08) 0%, rgba(74,101,68,0.04) 100%); border-radius: 12px; margin: 24px 0; }
            .total-amount .label { font-size: 12px; color: #636e72; text-transform: uppercase; letter-spacing: 0.5px; }
            .total-amount .amount { font-size: 32px; font-weight: 700; color: #4a6544; margin-top: 4px; }
            .info-box { background: #fff3cd; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 14px; }
            .info-box strong { color: #856404; }
            .footer { background: #f5f1e9; padding: 24px 40px; text-align: center; font-size: 12px; color: #636e72; }
            .footer a { color: #4a6544; text-decoration: none; }
            .button { display: inline-block; background: #4a6544; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed</h1>
              <p>Your reservation at ${data.propertyName} is confirmed</p>
            </div>
            <div class="content">
              <span class="success-badge">✓ Confirmed</span>
              <p class="greeting">Dear <strong>${data.guestName}</strong>,</p>
              <p>Thank you for choosing Trayati Stays! Your booking has been confirmed and we're excited to host you.</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <p class="property-name">${data.propertyName}</p>
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="label">Check-in</div>
                    <div class="value">${data.checkIn}</div>
                  </div>
                  <div class="detail-item">
                    <div class="label">Check-out</div>
                    <div class="value">${data.checkOut}</div>
                  </div>
                  <div class="detail-item">
                    <div class="label">Duration</div>
                    <div class="value">${data.nights} night${data.nights > 1 ? "s" : ""}</div>
                  </div>
                  <div class="detail-item">
                    <div class="label">Guests</div>
                    <div class="value">${data.guests}</div>
                  </div>
                </div>
              </div>

              <div class="total-amount">
                <div class="label">Total Amount Paid</div>
                <div class="amount">₹${data.amount.toLocaleString()}</div>
              </div>

              <div class="info-box">
                <strong>Check-in:</strong> 2:00 PM onwards<br>
                <strong>Check-out:</strong> Before 11:00 AM<br><br>
                <strong>Need help?</strong> Reply to this email or contact us at +91-XXXXXXXXXX
              </div>

              <p style="text-align: center;">
                <a href="https://trayati.com/booking/confirmation?bookingId=${data.bookingId}" class="button">View Booking Details</a>
              </p>

              <p>We look forward to welcoming you!</p>
              <p>Best regards,<br><strong>The Trayati Team</strong></p>
            </div>
            <div class="footer">
              <p>Booking ID: <strong>${data.bookingId}</strong></p>
              <p>© ${new Date().getFullYear()} Trayati Stays. All rights reserved.<br>
              <a href="https://trayati.com">trayati.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    return false;
  }
}

export async function sendAdminBookingNotification(data: BookingEmailData): Promise<boolean> {
  if (!resend || !process.env.ADMIN_EMAIL) {
    return false;
  }

  try {
    await resend.emails.send({
      from: "Trayati Bookings <bookings@trayati.com>",
      to: process.env.ADMIN_EMAIL,
      subject: `New Booking - ${data.propertyName}`,
      html: `
        <h2>New Booking Received</h2>
        <p><strong>Guest:</strong> ${data.guestName} (${data.guestEmail})</p>
        <p><strong>Property:</strong> ${data.propertyName}</p>
        <p><strong>Dates:</strong> ${data.checkIn} to ${data.checkOut} (${data.nights} nights)</p>
        <p><strong>Guests:</strong> ${data.guests}</p>
        <p><strong>Amount:</strong> ₹${data.amount.toLocaleString()}</p>
        <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    return false;
  }
}
