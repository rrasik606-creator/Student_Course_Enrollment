import mongoose from "mongoose";

import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};


// ENROLL IN COURSE
export const enrollInCourse = async (userId, courseId) => {
  if (!mongoose.isValidObjectId(courseId)) {
    throw createError("Invalid course ID", 400);
  }

  const course = await Course.findOne({
    _id: courseId,
    isPublished: true
  });

  if (!course) {
    throw createError("Course not found", 404);
  }

  const existing = await Enrollment.findOne({
    userId,
    courseId
  });

  if (existing) {
    if (existing.status === "active") {
      throw createError("Already enrolled in this course", 409);
    }

    existing.status = "active";
    existing.enrolledAt = new Date();

    return existing.save();
  }

  try {
    return await Enrollment.create({
      userId,
      courseId
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createError("Already enrolled in this course", 409);
    }

    throw error;
  }
};


// GET MY ENROLLMENTS
export const getMyEnrollments = async (userId, query) => {
  const filter = { userId };

  if (query.status) {
    const allowedStatuses = ["active", "cancelled", "completed"];

    if (!allowedStatuses.includes(query.status)) {
      throw createError("Invalid enrollment status", 400);
    }

    filter.status = query.status;
  }

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);

  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(query.limit, 10) || 10)
  );

  const [data, total] = await Promise.all([
    Enrollment.find(filter)
      .populate("courseId", "title description instructor duration tags")
      .sort({ enrolledAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Enrollment.countDocuments(filter)
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};


// CANCEL ENROLLMENT
export const cancelEnrollment = async (userId, enrollmentId) => {
  if (!mongoose.isValidObjectId(enrollmentId)) {
    throw createError("Invalid enrollment ID", 400);
  }

  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    userId
  });

  if (!enrollment) {
    throw createError("Enrollment not found", 404);
  }

  if (enrollment.status !== "active") {
    throw createError("Only active enrollments can be cancelled", 400);
  }

  enrollment.status = "cancelled";

  return enrollment.save();
};