import express from "express";
import {
  register,
  login,
  getProfile,
  googleLogin,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validators/auth.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/register", registerValidation, handleValidationErrors, register);
router.post("/login", login);
router.post("/forgot-password", forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidation, handleValidationErrors, resetPassword);
router.get("/me", protect, getProfile);
router.post("/google-login", googleLogin); // new route

export default router;
