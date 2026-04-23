/**
 * @module src/Utils/httpError.ts
 * @description Utility functions for creating a custom error class with HTTP status codes.
 */
class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export default HttpError;
