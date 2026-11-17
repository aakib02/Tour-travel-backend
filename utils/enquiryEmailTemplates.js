/**
 * Email templates for Enquiry Notifications
 */

export const getCustomerEnquiryEmailTemplate = (enquiry) => {
  const enquiryRef = enquiry._id
    ? `#${enquiry._id.toString().slice(-6).toUpperCase()}`
    : "#NEW";
  const dateFormatted = new Date(enquiry.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting India By Car And Driver</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
    }
    .wrapper {
      width: 100%;
      background-color: #f3f4f6;
      padding: 30px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%);
      padding: 35px 25px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 0.5px;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 14px;
      color: #e0f2fe;
    }
    .content {
      padding: 30px 25px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 12px;
    }
    .lead-text {
      font-size: 15px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 25px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
    }
    .card-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0284c7;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    .detail-row {
      display: flex;
      margin-bottom: 10px;
      font-size: 14px;
      line-height: 1.5;
    }
    .detail-label {
      width: 110px;
      color: #64748b;
      font-weight: 500;
      flex-shrink: 0;
    }
    .detail-value {
      color: #0f172a;
      font-weight: 600;
      word-break: break-word;
    }
    .message-box {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
    }
    .message-text {
      background: #ffffff;
      border-left: 3px solid #0284c7;
      padding: 10px 14px;
      margin-top: 6px;
      color: #334155;
      font-size: 13px;
      line-height: 1.6;
      border-radius: 0 6px 6px 0;
    }
    .steps-card {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 18px 20px;
      margin-bottom: 25px;
    }
    .steps-title {
      font-size: 14px;
      font-weight: 700;
      color: #065f46;
      margin-bottom: 6px;
    }
    .steps-desc {
      font-size: 13px;
      color: #047857;
      line-height: 1.5;
      margin: 0;
    }
    .contact-cta {
      text-align: center;
      padding: 20px 10px 10px;
      border-top: 1px solid #f1f5f9;
    }
    .cta-text {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 12px;
    }
    .btn {
      display: inline-block;
      background: #0284c7;
      color: #ffffff !important;
      text-decoration: none;
      padding: 10px 22px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      margin: 4px;
    }
    .footer {
      background-color: #0f172a;
      color: #94a3b8;
      text-align: center;
      padding: 24px 20px;
      font-size: 12px;
      line-height: 1.6;
    }
    .footer a {
      color: #38bdf8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <h1>India By Car And Driver</h1>
        <p>Premium Tours & Travel Experiences</p>
      </div>

      <!-- CONTENT -->
      <div class="content">
        <div class="greeting">Dear ${escapeHtml(enquiry.name || "Valued Traveler")},</div>
        <p class="lead-text">
          Thank you for reaching out to us! We have successfully received your enquiry. Our travel specialists are reviewing your request and will get back to you with the best personalized itinerary and pricing within <strong>24 hours</strong>.
        </p>

        <!-- ENQUIRY SUMMARY CARD -->
        <div class="card">
          <div class="card-title">Enquiry Summary (${enquiryRef})</div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 110px;"><strong>Reference:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${enquiryRef}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;"><strong>Date:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 13px;">${dateFormatted}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;"><strong>Subject:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${escapeHtml(enquiry.subject || "Travel Enquiry")}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;"><strong>Country:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 13px;">${escapeHtml(enquiry.country || "India")}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;"><strong>Phone:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 13px;">${escapeHtml(enquiry.phone || "-")}</td>
            </tr>
          </table>

          <div class="message-box">
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Your Message:</div>
            <div class="message-text">
              ${escapeHtml(enquiry.message || "").replace(/\n/g, "<br/>")}
            </div>
          </div>
        </div>

        <!-- WHAT NEXT -->
        <div class="steps-card">
          <div class="steps-title">✈️ What Happens Next?</div>
          <p class="steps-desc">
            One of our dedicated destination experts will prepare a custom plan tailored to your preferences and connect with you via email or phone.
          </p>
        </div>

        <!-- QUICK CONTACT -->
        <div class="contact-cta">
          <div class="cta-text">Have an urgent requirement or want to discuss right away?</div>
          <a href="tel:+919829807074" class="btn" style="background:#0284c7;">📞 Call Us</a>
          <a href="mailto:indiabycaranddriver@gmail.com" class="btn" style="background:#047857;">✉️ Email Support</a>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p style="margin: 0 0 8px;"><strong>India By Car And Driver</strong></p>
        <p style="margin: 0 0 8px;">Crafting unforgettable journeys across India.</p>
        <p style="margin: 0; font-size: 11px; color: #64748b;">
          If you did not initiate this request, please disregard this email or notify us at 
          <a href="mailto:indiabycaranddriver@gmail.com">indiabycaranddriver@gmail.com</a>.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

export const getAdminEnquiryAlertTemplate = (enquiry) => {
  const enquiryRef = enquiry._id
    ? `#${enquiry._id.toString().slice(-6).toUpperCase()}`
    : "#NEW";
  const dateFormatted = new Date(enquiry.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Customer Enquiry Alert</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 30px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 24px;
      color: #ffffff;
      border-bottom: 4px solid #ef4444;
    }
    .badge {
      display: inline-block;
      background: #ef4444;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
    }
    .content {
      padding: 26px 24px;
    }
    .table-details {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .table-details td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .table-details td.label {
      width: 130px;
      font-weight: 600;
      color: #64748b;
      background-color: #f8fafc;
    }
    .table-details td.value {
      color: #0f172a;
      font-weight: 500;
      word-break: break-word;
    }
    .message-container {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .message-heading {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #c2410c;
      margin-bottom: 8px;
    }
    .message-body {
      font-size: 14px;
      color: #7c2d12;
      line-height: 1.6;
    }
    .actions {
      text-align: center;
      padding: 15px 0 5px;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      margin: 4px;
    }
    .btn-primary {
      background: #2563eb;
      color: #ffffff !important;
    }
    .btn-call {
      background: #059669;
      color: #ffffff !important;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 16px 20px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <span class="badge">🚨 Action Required</span>
        <h2>New Travel Enquiry Received</h2>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
          Reference ID: <strong style="color: #f8fafc;">${enquiryRef}</strong> | ${dateFormatted}
        </div>
      </div>

      <!-- CONTENT -->
      <div class="content">
        <!-- DETAILS TABLE -->
        <table class="table-details">
          <tr>
            <td class="label">Customer Name</td>
            <td class="value"><strong>${escapeHtml(enquiry.name || "N/A")}</strong></td>
          </tr>
          <tr>
            <td class="label">Email Address</td>
            <td class="value">
              <a href="mailto:${escapeHtml(enquiry.email || "")}" style="color: #2563eb; text-decoration: none; font-weight: 600;">
                ${escapeHtml(enquiry.email || "N/A")}
              </a>
            </td>
          </tr>
          <tr>
            <td class="label">Phone / Mobile</td>
            <td class="value">
              <a href="tel:${escapeHtml(enquiry.phone || "")}" style="color: #059669; text-decoration: none; font-weight: 600;">
                ${escapeHtml(enquiry.phone || "N/A")}
              </a>
            </td>
          </tr>
          ${
            enquiry.company
              ? `<tr>
                  <td class="label">Company</td>
                  <td class="value">${escapeHtml(enquiry.company)}</td>
                </tr>`
              : ""
          }
          <tr>
            <td class="label">Country</td>
            <td class="value">${escapeHtml(enquiry.country || "India")}</td>
          </tr>
          <tr>
            <td class="label">Subject</td>
            <td class="value"><strong>${escapeHtml(enquiry.subject || "N/A")}</strong></td>
          </tr>
        </table>

        <!-- MESSAGE -->
        <div class="message-container">
          <div class="message-heading">Customer Message:</div>
          <div class="message-body">
            ${escapeHtml(enquiry.message || "No message provided").replace(/\n/g, "<br/>")}
          </div>
        </div>

        <!-- QUICK ACTIONS -->
        <div class="actions">
          <a href="mailto:${escapeHtml(enquiry.email || "")}?subject=Re: ${encodeURIComponent(enquiry.subject || 'Enquiry with India By Car And Driver')}" class="btn btn-primary">
            ✉️ Reply via Email
          </a>
          <a href="tel:${escapeHtml(enquiry.phone || "")}" class="btn btn-call">
            📞 Call Customer
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        Automated alert generated by <strong>Tour & Travel Backend System</strong>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

function escapeHtml(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
