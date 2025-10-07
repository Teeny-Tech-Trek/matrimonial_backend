// src/controllers/auth.controller.js
import { registerUser, loginUser, googleLoginUser } from "../services/auth.service.js"; // assuming you put your functions in auth.service.js

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
