import { Router } from "express";

import {
  getMyProfile,
  updateMyProfile
} from "../controllers/userController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";

const router = Router();

// All user routes require authentication.
router.use(authenticate);

// Get own profile.
router.get("/profile", getMyProfile);

// Update own profile.
router.patch(
  "/profile",
  validateBody(
    ["name", "email", "password"],
    { partial: true }
  ),
  updateMyProfile
);

export default router;