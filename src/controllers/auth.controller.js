// src/controllers/auth.controller.js
import {
  registerUser,
  loginUser,
  googleLoginUser,
  forgotPasswordByEmail,
  resetPasswordWithToken,
} from "../services/auth.service.js"; // assuming you put your functions in auth.service.js

// Controller for registering a new user
export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Controller for login
export const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const result = await loginUser(phoneNumber, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// Controller to get current user profile
export const getProfile = async (req, res) => {
  try {
    // assuming you have middleware that sets req.user
    const user = req.user;
    if (!user) throw new Error("User not found");
    res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      profileCreatedFor: user.profileCreatedFor,
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const result = await googleLoginUser(idToken);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordByEmail(email);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const result = await resetPasswordWithToken(token, password);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 400;
    res.status(err.statusCode);
    next(err);
  }
};
