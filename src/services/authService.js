import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  getRefreshExpiryDate
} from "../utils/tokenUtils.js";

// Refresh token schema and model
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true
    },

    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const RefreshToken =
  mongoose.models.RefreshToken ||
  mongoose.model("RefreshToken", refreshTokenSchema);


// Helper function to create tokens
const generateTokens = async (user) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshExpiryDate()
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  };
};


// REGISTER
export const registerUser = async (input) => {
  const existingUser = await User.findOne({
    email: input.email.toLowerCase()
  });

  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    role: "student"
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};


// LOGIN
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    email: email.toLowerCase()
  }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return generateTokens(user);
};


// REFRESH TOKEN ROTATION
export const rotateRefreshToken = async (token) => {
  if (!token) {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    throw error;
  }

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );
  } catch {
    const error = new Error("Invalid or expired refresh token");
    error.statusCode = 401;
    throw error;
  }

  if (decoded.type !== "refresh") {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const oldTokenHash = hashToken(token);

  // Delete the old token so it cannot be reused.
  const oldToken = await RefreshToken.findOneAndDelete({
    tokenHash: oldTokenHash,
    userId: decoded.sub,
    expiresAt: { $gt: new Date() }
  });

  if (!oldToken) {
    const error = new Error("Refresh token already used or revoked");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.sub);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }

  // Generate a new access token and refresh token.
  return generateTokens(user);
};


// LOGOUT
export const logoutUser = async (token) => {
  if (!token) return;

  await RefreshToken.deleteOne({
    tokenHash: hashToken(token)
  });
};