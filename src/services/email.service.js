import nodemailer from "nodemailer";
import dotenv from "dotenv";
import validator from "validator"; // For input sanitization

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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
    from: `"${sanitizedName}" <${process.env.EMAIL_USER}>`, // Sender name, but email from EMAIL_USER
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