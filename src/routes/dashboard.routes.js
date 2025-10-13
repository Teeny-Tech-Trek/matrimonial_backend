import express from "express";
import {
  getDashboardData,
  getDashboardStats,
  getRecommendedProfiles,
  getQuickFilters
} from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js"; // assumed JWT auth

const router = express.Router();

// All routes are protected


router.get("/",protect, getDashboardData);
router.get("/stats",protect, getDashboardStats);
router.get("/recommended",protect, getRecommendedProfiles);
router.get("/filters",protect, getQuickFilters);

export default router;
