import { sendContactEmail } from "../services/email.service.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await sendContactEmail({ name, email, subject, message });

    res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending contact form:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};
