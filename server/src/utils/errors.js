export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors.map((item) => ({
        path: item.path.join("."),
        message: item.message
      }))
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value" });
  }

  res.status(statusCode).json({
    message: err.isOperational ? err.message : "Something went wrong"
  });
}
