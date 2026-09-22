import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  },
});

/* =======================================================
   SEND OTP EMAIL
======================================================= */
export const sendOTPEmail = async ({ to, otp, subject, purpose }) => {
  const purposeText =
    {
      verify: "verify your admin account",
      reset: "reset your admin password",
      login: "complete your admin login",
    }[purpose] || "complete your action";

  const mailOptions = {
    from: `"Admin Panel" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
    to,
    subject: subject || "Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #111827; margin-bottom: 8px;">Admin Panel</h2>
        <p style="color: #6b7280;">Use the OTP below to ${purposeText}.</p>

        <div style="
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 10px;
          color: #4f46e5;
          background: #eef2ff;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 24px 0;
        ">
          ${otp}
        </div>

        <p style="color: #6b7280; font-size: 13px;">
          This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
