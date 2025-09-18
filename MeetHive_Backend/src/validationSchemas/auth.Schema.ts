/**
 * @module src/validationSchemas/auth.Schema.ts
 * @description Middleware for validation schemas on user registration and login data using Zod.
 */
import * as z from "zod";

// Validation schema for user registration
const registrationSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters long" })
    .max(100, { error: "Name must not be more than 100 characters" }),
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long" })
    .regex(/[0-9]/, { error: "Password must contain at least one number" })
    .regex(/[\W_]/, {
      error: "Password must contain at least one special character",
    }),
  avatarUrl: z.string().optional(),
  bio: z
    .string()
    .max(500, {
      error: "Your bio description should not be more than 500 characters",
    })
    .optional(),
});

// Validation schema for user login
const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(8).max(128),
});

export { registrationSchema, loginSchema };
