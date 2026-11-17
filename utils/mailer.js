import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.MAIL_PORT) || 587;
const isSecure = process.env.MAIL_SECURE === "true" || port === 465;

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: port,
  secure: isSecure,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  // Keep connections alive and prevent silent socket dropouts
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// Verify connection on startup (asynchronous, non-blocking)
if (process.env.MAIL_USER && process.env.MAIL_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.warn("⚠️ SMTP Verification warning:", error.message);
    } else {
      console.log("✅ SMTP Server ready to send emails");
    }
  });
} else {
  console.warn("⚠️ MAIL_USER or MAIL_PASS is missing in environment variables.");
}

/**
 * Universal email dispatch helper
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text fallback
 * @param {string} [options.from] - Custom sender header
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendEmail = async ({ to, subject, html, text, from }) => {
  try {
    if (!to) {
      throw new Error("Recipient email ('to') is required");
    }

    const defaultFrom =
      process.env.MAIL_FROM ||
      `"${process.env.MAIL_FROM_NAME || "India By Car And Driver"}" <${process.env.MAIL_USER}>`;

    const mailOptions = {
      from: from || defaultFrom,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

export default transporter;