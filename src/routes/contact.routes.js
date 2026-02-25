import express from "express";
import { getPublicReviews, submitContactForm, submitReview } from "../controllers/contact.controller.js";

const router = express.Router();

// POST /api/contact
router.post("/contact", submitContactForm);
router.post("/reviews", submitReview);
router.get("/reviews", getPublicReviews);

export default router;
