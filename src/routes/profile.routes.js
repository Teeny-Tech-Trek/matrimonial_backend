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
import { protect } from "../middlewares/auth.middleware.js"; // Use protect instead of authenticate
import {
  saveProfile,
  getProfile,
  getMyProfile,
  listProfiles,
  removeProfile,
  updateSearchPreferences,
} from "../controllers/profile.controller.js";

const router = express.Router();

// IMPORTANT: Specific routes BEFORE parameterized routes
router.get("/me", protect, getMyProfile);           // GET /api/profile/me
router.post("/", protect, saveProfile);             // POST /api/profile/ (not /save)
router.post("/save", protect, saveProfile);         // POST /api/profile/save (add this for your frontend)
router.patch("/preferences/search", protect, updateSearchPreferences);
router.get("/list", listProfiles);                  // GET /api/profile/list
router.get("/:id", getProfile);                     // GET /api/profile/:id
router.delete("/", protect, removeProfile);         // DELETE /api/profile/

export default router;
