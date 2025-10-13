import express from "express";
import {
  listConversations,
  getMessages,
  sendNewMessage,
  createNewConversation,
} from "../controllers/message.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔐 Auth required for all message endpoints
router.get("/conversations", protect, listConversations);
router.get("/conversation/:conversationId", protect, getMessages);
router.post("/send", protect, sendNewMessage);
router.post("/start", protect, createNewConversation);

export default router;
