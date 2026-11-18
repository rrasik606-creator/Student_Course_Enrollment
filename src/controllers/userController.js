import * as userService from "../services/userService.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user._id);

    res.status(200).json({
      data: user
    });
  } catch (error) {
    next(error);
  }
};


export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(
      req.user._id,
      req.body
    );

    res.status(200).json({
      message: "Profile updated successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};