import { sendContactEmail } from "../services/email.service.js";
import Review from "../models/review.model.js";

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
    res.status(500).json({ error: error.message || "Failed to send message" });
  }
};

export const submitReview = async (req, res) => {
  try {
    const { name, city, rating, text } = req.body;

    if (!name || !city || !rating || !text) {
      return res.status(400).json({ error: "Name, city, rating and review are required" });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const review = await Review.create({
      name: String(name).trim(),
      city: String(city).trim(),
      rating: numericRating,
      text: String(text).trim(),
      isActive: true,
      status: "hold",
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to submit review" });
  }
};

export const getPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isActive: true, status: "approved" })
      .sort({ createdAt: -1 })
      .limit(30)
      .select("name city rating text createdAt");

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch reviews" });
  }
};
