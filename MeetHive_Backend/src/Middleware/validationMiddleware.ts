/**
 * @module src/Middleware/validationMiddleware
 * @description Middleware to validate request bodies against Zod schemas.
 */
import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import HttpError from "../Utils/HttpError.js";

/**
 * @function validate
 * @description Middleware to validate request bodies against a given Zod schema.
 * @param schema - Zod schema to validate against
 */
const validate =
  (schema: ZodType) =>
  (request: Request, _response: Response, next: NextFunction) => {
    try {
      schema.parse(request.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        next(new HttpError(400, message));
      } else {
        next(new HttpError(400, "Invalid request data"));
      }
    }
  };
export default validate;
