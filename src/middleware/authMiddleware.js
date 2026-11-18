import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token is required"
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );
    } catch {
      return res.status(401).json({
        message: "Invalid or expired access token"
      });
    }

    if (decoded.type !== "access") {
      return res.status(401).json({
        message: "Invalid access token"
      });
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};