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
    console.error("Error in contact form submission:", error.message);
    res.status(500).json({ error: error.message || "Failed to send message" });
  }
};