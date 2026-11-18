import mongoose from "mongoose";

import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};


// GET ALL COURSES
export const getAllCourses = async (query) => {
  const filter = {
    isPublished: true
  };

  // Search by title, instructor or tags.
  if (query.search) {
    const search = escapeRegex(query.search);

    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { instructor: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } }
    ];
  }

  // Filter by instructor.
  if (query.instructor) {
    filter.instructor = {
      $regex: escapeRegex(query.instructor),
      $options: "i"
    };
  }

  // Filter by duration.
  if (query.minDuration || query.maxDuration) {
    filter.duration = {};

    if (query.minDuration) {
      filter.duration.$gte = Number(query.minDuration);
    }

    if (query.maxDuration) {
      filter.duration.$lte = Number(query.maxDuration);
    }

    if (
      !Number.isFinite(filter.duration.$gte ?? 0) ||
      !Number.isFinite(filter.duration.$lte ?? 0)
    ) {
      throw createError("Invalid duration filter", 400);
    }
  }

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);

  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(query.limit, 10) || 10)
  );

  const sortBy = ["title", "duration", "createdAt"].includes(query.sortBy)
    ? query.sortBy
    : "createdAt";

  const order = query.order === "asc" ? 1 : -1;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit),

    Course.countDocuments(filter)
  ]);

  return {
    data: courses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};


// GET COURSE BY ID
export const getCourseById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid course ID", 400);
  }

  const course = await Course.findOne({
    _id: id,
    isPublished: true
  });

  if (!course) {
    throw createError("Course not found", 404);
  }

  return course;
};


// CREATE COURSE
export const createCourse = async (input) => {
  return Course.create(input);
};


// UPDATE COURSE
export const updateCourse = async (id, input) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid course ID", 400);
  }

  const course = await Course.findByIdAndUpdate(
    id,
    input,
    {
      new: true,
      runValidators: true
    }
  );

  if (!course) {
    throw createError("Course not found", 404);
  }

  return course;
};


// DELETE COURSE (SOFT DELETE)
export const deleteCourse = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid course ID", 400);
  }

  const activeEnrollments = await Enrollment.countDocuments({
    courseId: id,
    status: "active"
  });

  if (activeEnrollments > 0) {
    throw createError(
      "Cannot delete a course with active enrollments",
      409
    );
  }

  const course = await Course.findByIdAndUpdate(
    id,
    { isPublished: false },
    { new: true }
  );

  if (!course) {
    throw createError("Course not found", 404);
  }

  return course;
};