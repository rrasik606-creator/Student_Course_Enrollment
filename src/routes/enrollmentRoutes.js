import { Router } from "express";

import {
  enroll,
  getMyEnrollments,
  cancelEnrollment
} from "../controllers/enrollmentController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = Router();

// All enrollment endpoints require a logged-in student.
router.use(authenticate, checkRole("student"));

// Enroll in a course.
router.post("/:courseId", enroll);

// Get logged-in student's enrollments.
router.get("/my", getMyEnrollments);

// Cancel an enrollment.
router.patch("/:id/cancel", cancelEnrollment);

export default router;