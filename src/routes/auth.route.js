import express from "express";
import { register, login, getProfile,googleLogin } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getProfile);
router.post("/google-login", googleLogin); // new route

export default router;
