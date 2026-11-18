export const notFound = (req, res, next) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  if (error.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "This value already exists";
  }

  if (
    [
      "MongoServerSelectionError",
      "MongoNetworkError",
      "MongoNetworkTimeoutError",
      "MongoNotConnectedError"
    ].includes(error.name)
  ) {
    statusCode = 503;
    message = "Database temporarily unavailable";
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    status: statusCode < 500 ? "fail" : "error",
    message
  });
};