import User from "../models/auth.model.js";
import Profile from "../models/profile.model.js";
import { generateToken } from "../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { sendPasswordResetEmail } from "./email.service.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLoginUser = async (idToken) => {
  // Verify Google token
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, sub, picture } = payload;

  // Find or create user based on email or googleId
  let user = await User.findOne({ phoneNumber: email }); // using email as unique id
  if (!user) {
    user = await User.create({
      fullName: name,
      phoneNumber: email, // since Google doesn’t share phone by default
      gender: "male", // optional, default values
      dateOfBirth: new Date("2000-01-01"), // placeholder
      profileCreatedFor: "self",
      password: sub, // hashed later by pre-save hook
    });
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
    },
  };
};

export const registerUser = async (data) => {
  const existingUser = await User.findOne({ phoneNumber: data.phoneNumber });
  if (existingUser) {
    throw new Error("Phone number already registered");
  }

  const user = await User.create(data);
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      profileCreatedFor: user.profileCreatedFor,
      role: user.role,
    },
  };
};

export const loginUser = async (phoneNumber, password) => {
  const user = await User.findOne({ phoneNumber });
  if (!user) throw new Error("Invalid phone number or password");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Invalid phone number or password");

  const token = generateToken(user);
  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      gender: user.gender,
    },
  };
};

const GENERIC_FORGOT_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";

export const forgotPasswordByEmail = async (rawEmail) => {
  const normalizedEmail = String(rawEmail || "").trim().toLowerCase();

  // Avoid account enumeration through input validation errors.
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { message: GENERIC_FORGOT_MESSAGE };
  }

  const profile = await Profile.findOne({ email: normalizedEmail }).select("userId");
  let user = null;

  if (profile?.userId) {
    user = await User.findOne({ _id: profile.userId, isActive: true });
  }

  // Backward compatibility: allow reset for users whose email exists on User
  // but profile email is missing/not synced yet.
  if (!user) {
    user = await User.findOne({ email: normalizedEmail, isActive: true });
  }

  if (!user) {
    console.info(`[forgot-password] No account found for email: ${normalizedEmail}`);
    return { message: GENERIC_FORGOT_MESSAGE };
  }

  if (user.email !== normalizedEmail) {
    user.email = normalizedEmail;
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error("FRONTEND_URL is not configured");
  }

  const resetUrl = `${frontendUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail({
      toEmail: normalizedEmail,
      resetUrl,
      fullName: user.fullName,
    });
    console.info(`[forgot-password] Reset email queued for userId=${user._id} email=${normalizedEmail}`);
  } catch (err) {
    // Rollback token on mail failure.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.error(`[forgot-password] Mail send failed for userId=${user._id} email=${normalizedEmail}: ${err.message}`);
    throw new Error("Failed to send password reset email");
  }

  return { message: GENERIC_FORGOT_MESSAGE };
};

export const resetPasswordWithToken = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(String(token)).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
    isActive: true,
  });

  if (!user) {
    const error = new Error("Invalid or expired reset token");
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return { message: "Password reset successful" };
};
