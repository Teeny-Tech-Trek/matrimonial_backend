import nodemailer from "nodemailer";
import validator from "validator"; // For input sanitization

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || process.env.MAIL_PORT || 587),
  secure: Number(process.env.EMAIL_PORT || process.env.MAIL_PORT || 587) === 465,
  auth: {
    user: process.env.EMAIL_USER || process.env.MAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.MAIL_PASS,
  },
});

/**
 * Send contact form details via email
 * @param {Object} data - Contact form data
 * @param {string} data.name - Sender's name
 * @param {string} data.email - Sender's email
 * @param {string} data.subject - Email subject
 * @param {string} data.message - Email message
 * @throws {Error} If validation fails or email sending fails
 */
export const sendContactEmail = async ({ name, email, subject, message }) => {
  // Input validation and sanitization
  if (!name || !email || !subject || !message) {
    throw new Error("All fields are required");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email address");
  }

  // Sanitize inputs to prevent XSS or injection
  const sanitizedName = validator.escape(name.trim());
  const sanitizedSubject = validator.escape(subject.trim());
  const sanitizedMessage = validator.escape(message.trim());

  const mailOptions = {
    from: `"${sanitizedName}" <${process.env.MAIL_USER}>`, // Sender name, but email from MAIL_USER
    to: "rsaristomatch@gmail.com", // Destination email
    replyTo: email, // Allows replies to go to the user's email
    subject: `New Contact Form Message: ${sanitizedSubject}`,
    text: `
You received a new message from your website contact form.

Name: ${sanitizedName}
Email: ${email}
Subject: ${sanitizedSubject}
Message:
${sanitizedMessage}
`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #c026d3;">New Contact Form Message</h2>
        <p><strong>Name:</strong> ${sanitizedName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${sanitizedSubject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${sanitizedMessage.replace(/\n/g, "<br>")}</p>
        <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          This email was sent from the RSAristoMatch contact form. For grievances, reply directly to this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Failed to send email");
  }
};

export const sendPasswordResetEmail = async ({ toEmail, resetUrl, fullName }) => {
  if (!toEmail || !resetUrl) {
    throw new Error("Email and reset URL are required");
  }

  if (!validator.isEmail(toEmail)) {
    throw new Error("Invalid recipient email address");
  }

  const safeName = validator.escape((fullName || "User").trim());

  const mailOptions = {
    from: `"RSAristoMatch Security" <${process.env.EMAIL_USER || process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Reset your RSAristoMatch password",
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;color:#e2e8f0;">
        <div style="max-width:600px;margin:0 auto;background:#111827;border:1px solid #374151;border-radius:12px;overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #374151;">
            <h2 style="margin:0;color:#e2e8f0;">Password Reset Request</h2>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 12px;">Hi ${safeName},</p>
            <p style="margin:0 0 18px;line-height:1.6;color:#cbd5e1;">
              We received a request to reset your password. Click the button below to create a new password.
              This link expires in 15 minutes.
            </p>
            <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
              Reset Password
            </a>
            <p style="margin:18px 0 0;line-height:1.6;color:#94a3b8;">
              If the button does not work, copy and paste this link into your browser:
            </p>
            <p style="word-break:break-all;color:#a5b4fc;">${resetUrl}</p>
            <p style="margin-top:18px;line-height:1.6;color:#94a3b8;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Hi ${safeName}, reset your password using this link (valid for 15 minutes): ${resetUrl}`,
  };

  await transporter.sendMail(mailOptions);
};
