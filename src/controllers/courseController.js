import * as courseService from "../services/courseService.js";

export const getCourses = async (req, res, next) => {
  try {
    const result = await courseService.getAllCourses(req.query);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const getCourse = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);

    res.status(200).json({
      data: course
    });
  } catch (error) {
    next(error);
  }
};


export const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body);

    res.status(201).json({
      message: "Course created successfully",
      data: course
    });
  } catch (error) {
    next(error);
  }
};


export const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Course updated successfully",
      data: course
    });
  } catch (error) {
    next(error);
  }
};


export const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id);

    res.status(200).json({
      message: "Course unpublished successfully"
    });
  } catch (error) {
    next(error);
  }
};