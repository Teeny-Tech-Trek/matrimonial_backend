// routes/admin.routes.js
import express from "express";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import * as AdminController from "../controllers/admin.controller.js";

const router = express.Router();

// Protect all admin routes
router.use(requireAdmin);

// Header stats
router.get("/stats", AdminController.getAdminStats);

// Users
router.get("/users", AdminController.listUsers);
router.get("/users/export", AdminController.exportUsers);
router.get("/users/:userId", AdminController.getUser);
router.put("/users/:userId", AdminController.updateUser); // update role / active etc
router.delete("/users/:userId", AdminController.deleteUser); // soft delete

// Profiles
router.get("/profiles", AdminController.listProfiles);
router.put("/profiles/:profileId/verify", AdminController.verifyProfile);
router.put("/profiles/:profileId/photos/:photoId/moderate", AdminController.moderatePhoto);

// Requests & connections
router.get("/requests", AdminController.listRequests);

// Conversations/messages
router.get("/conversations", AdminController.listConversations);

// Quick admin search
router.get("/search", AdminController.quickSearch);

export default router;
