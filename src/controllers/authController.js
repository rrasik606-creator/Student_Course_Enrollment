import * as authService from "../services/authService.js";

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      message: "Registration successful",
      data: user
    });
  } catch (error) {
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);

    res.status(200).json({
      message: "Login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
};


export const refresh = async (req, res, next) => {
  try {
    const result = await authService.rotateRefreshToken(
      req.body.refreshToken
    );

    res.status(200).json({
      message: "Token refreshed successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};


export const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.body.refreshToken);

    res.status(200).json({
      message: "Logged out successfully"
    });
  } catch (error) {
    next(error);
  }
};