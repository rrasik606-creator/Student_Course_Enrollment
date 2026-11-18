import bcrypt from "bcrypt";
import User from "../models/User.js";

export const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};


export const updateProfile = async (userId, input) => {
  const updates = {};

  if (input.name !== undefined) {
    updates.name = input.name;
  }

  if (input.email !== undefined) {
    updates.email = input.email;
  }

  if (input.password !== undefined) {
    updates.password = await bcrypt.hash(input.password, 12);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};