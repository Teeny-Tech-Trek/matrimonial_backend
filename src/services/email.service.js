import nodemailer from "nodemailer";
import dotenv from "dotenv";

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
 */
export const sendContactEmail = async ({ name, email, subject, message }) => {
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: "rsaristomatch@gmail.com", // destination email
    subject: `New Contact Form Message: ${subject}`,
    text: `
You received a new message from your website contact form.

Name: ${name}
Email: ${email}
Subject: ${subject}
Message:
${message}
`,
  };

  await transporter.sendMail(mailOptions);
};
