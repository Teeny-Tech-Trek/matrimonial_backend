import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createRequest,
  getMyReceivedRequests,
  getMySentRequests,
  updateStatus,
  removeRequest,
  getRequestStatistics,
  getAcceptedConnections,
} from "../controllers/request.controller.js";

const router = express.Router();
router.get("/connections/accepted", protect, getAcceptedConnections);
router.post("/send", protect, createRequest);
router.get("/received", protect, getMyReceivedRequests);
router.get("/sent", protect, getMySentRequests);
router.get("/stats", protect, getRequestStatistics);
router.put("/:requestId/status", protect, updateStatus);
router.delete("/:requestId", protect, removeRequest);

export default router;