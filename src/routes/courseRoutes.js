import { Router } from "express";

import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} from "../controllers/courseController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";

const router = Router();

// Public: get all courses.
router.get("/", getCourses);

// Public: get one course.
router.get("/:id", getCourse);

// Admin: create a course.
router.post(
  "/",
  authenticate,
  checkRole("admin"),
  validateBody(
    ["title", "description", "instructor", "duration", "tags"],
    { optionalFields: ["tags"] }
  ),
  createCourse
);

// Admin: update a course.
router.patch(
  "/:id",
  authenticate,
  checkRole("admin"),
  validateBody(
    ["title", "description", "instructor", "duration", "tags", "isPublished"],
    { partial: true }
  ),
  updateCourse
);

// Admin: delete/unpublish a course.
router.delete(
  "/:id",
  authenticate,
  checkRole("admin"),
  deleteCourse
);

export default router;