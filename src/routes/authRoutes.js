import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout
} from "../controllers/authController.js";

import { validateBody } from "../middleware/validateMiddleware.js";

const router = Router();

router.post(
  "/register",
  validateBody(
    ["name", "email", "password"]
  ),
  register
);

router.post(
  "/login",
  validateBody(["email", "password"]),
  login
);

router.post(
  "/refresh",
  validateBody(["refreshToken"]),
  refresh
);

router.post(
  "/logout",
  validateBody(["refreshToken"]),
  logout
);

export default router;