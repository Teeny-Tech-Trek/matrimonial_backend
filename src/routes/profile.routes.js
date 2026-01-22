// import express from "express";
// import {
//   saveProfile,
//   getProfile,
//   getMyProfile,
//   listProfiles,
//   removeProfile,
// } from "../controllers/profile.controller.js";
// import { protect } from "../middlewares/auth.middleware.js"; // assumed JWT auth

// const router = express.Router();

// // 🔐 Auth required for personal actions
// router.post("/save", protect, saveProfile);         // Create/Update
// router.get("/me", protect, getMyProfile);       // Get logged-in user's profile
// router.delete("/", protect, removeProfile);     // Delete my profile

// // 🌍 Public routes
// router.get("/list", listProfiles);                       // Get all profiles with filters
// router.get("/:id", getProfile);                      // Get specific profile

// export default router;

import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  saveProfile,
  getProfile,
  getMyProfile,
  listProfiles,
  removeProfile,
} from "../controllers/profile.controller.js";

const router = express.Router();

// Add this route BEFORE the /:id route
router.get("/me", authenticate, getMyProfile);

router.post("/", authenticate, saveProfile);
router.get("/:id", getProfile);
router.get("/", listProfiles);
router.delete("/", authenticate, removeProfile);

export default router;