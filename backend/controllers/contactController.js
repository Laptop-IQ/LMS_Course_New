// controllers/contactController.js
import nodemailer from "nodemailer";

// ── Transporter ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Sanitize (prevents XSS in email HTML) ────────────────────────────────────
const sanitize = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

// ── Controller ────────────────────────────────────────────────────────────────
export const sendContactMail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide a valid email address.",
        });
    }
    if (message.trim().length < 10) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Message must be at least 10 characters.",
        });
    }

    // ── Sanitize inputs ───────────────────────────────────────────────────────
    const safeName = sanitize(name);
    const safeEmail = sanitize(email.trim());
    const safeSubject = sanitize(subject);
    const safeMessage = sanitize(message).replace(/\n/g, "<br>");
    const year = new Date().getFullYear();

    // ── Admin notification email ──────────────────────────────────────────────
    const adminMail = {
      from: `"LearnHub Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `[LearnHub] New Contact — ${safeSubject}`,
      html: `
        <!DOCTYPE html><html lang="en">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#06b6d4,#7c3aed);padding:28px 32px;">
                    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">📬 New Contact Submission</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">LearnHub LMS — Contact Inbox</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                        <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Name</span><br>
                        <span style="color:#0f172a;font-size:15px;font-weight:500;">${safeName}</span>
                      </td></tr>
                      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                        <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Email</span><br>
                        <a href="mailto:${safeEmail}" style="color:#0891b2;font-size:15px;">${safeEmail}</a>
                      </td></tr>
                      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                        <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Subject</span><br>
                        <span style="color:#0f172a;font-size:15px;font-weight:500;">${safeSubject}</span>
                      </td></tr>
                      <tr><td style="padding:16px 0 0;">
                        <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Message</span>
                        <div style="margin-top:10px;padding:16px;background:#f8fafc;border-radius:8px;
                          border-left:3px solid #06b6d4;color:#334155;font-size:14px;line-height:1.7;">
                          ${safeMessage}
                        </div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;">
                      Sent automatically from LearnHub LMS contact form
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body></html>
      `,
    };

    // ── User confirmation email ───────────────────────────────────────────────
    const userMail = {
      from: `"LearnHub Team" <${process.env.EMAIL_USER}>`,
      to: email.trim(),
      subject: "We received your message — LearnHub",
      html: `
        <!DOCTYPE html><html lang="en">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#06b6d4,#7c3aed);padding:28px 32px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">LearnHub LMS</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Courses · Mentorship · Career · Tech</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px 32px;">
                    <h2 style="margin:0 0 12px;color:#0f172a;font-size:18px;">Hello ${safeName} 👋</h2>
                    <p style="margin:0 0 20px;color:#334155;font-size:14px;line-height:1.7;">
                      Thank you for reaching out! We've received your message and will
                      get back to you within a few hours.
                    </p>
                    <div style="background:#f8fafc;border-radius:10px;padding:20px;border:1px solid #e2e8f0;margin-bottom:24px;">
                      <p style="margin:0 0 14px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Your submitted details</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr><td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="color:#64748b;font-size:12px;">Subject</span><br>
                          <span style="color:#0f172a;font-size:14px;font-weight:500;">${safeSubject}</span>
                        </td></tr>
                        <tr><td style="padding:12px 0 0;">
                          <span style="color:#64748b;font-size:12px;">Message</span>
                          <div style="margin-top:6px;color:#334155;font-size:13px;line-height:1.7;">${safeMessage}</div>
                        </td></tr>
                      </table>
                    </div>
                    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                      Questions? Reply to this email or write to
                      <a href="mailto:${sanitize(process.env.EMAIL_USER)}" style="color:#0891b2;">
                        ${sanitize(process.env.EMAIL_USER)}
                      </a>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 32px;">
                    <p style="margin:0;color:#334155;font-size:14px;">
                      Warm regards,<br>
                      <strong style="color:#0f172a;">The LearnHub Team</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;">
                      © ${year} LearnHub LMS. You received this because you contacted us.
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body></html>
      `,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    return res.status(200).json({
      success: true,
      message:
        "Your message has been sent! A confirmation email is on its way.",
    });
  } catch (error) {
    console.error("MAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};
