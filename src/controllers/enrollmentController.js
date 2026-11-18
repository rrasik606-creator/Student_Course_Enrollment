import * as enrollmentService from "../services/enrollmentService.js";

export const enroll = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.enrollInCourse(
      req.user._id,
      req.params.courseId
    );

    res.status(201).json({
      message: "Enrollment successful",
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};


export const getMyEnrollments = async (req, res, next) => {
  try {
    const result = await enrollmentService.getMyEnrollments(
      req.user._id,
      req.query
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const cancelEnrollment = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.cancelEnrollment(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      message: "Enrollment cancelled successfully",
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};