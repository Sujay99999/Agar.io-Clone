// this is a customied error class derived form the original error class

class AppError extends Error {
  constructor(message, statusCode) {
    // calling the error(message)
    super(message);

    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.operational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
