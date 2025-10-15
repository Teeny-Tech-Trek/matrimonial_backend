import User from "../models/auth.model.js";
import { generateToken } from "../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";

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
       role:user.role,
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
      role:user.role,
    },
  };
};
