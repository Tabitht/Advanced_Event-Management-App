/**
 * @module src/validationSchemas/auth.Schema.ts
 * @description Middleware for validation schemas on user registration and login data using Zod.
 */
import * as z from "zod";

/**
 * @description Validation schema for user registration
 * @type {Object} RegistrationSchema
 * @property {string} name - User's full name (min 2 characters, max 100 characters)
 * @property {string} email - User's email address (must be valid format)
 * @property {string} password - User's password (min 8 characters, must include at least one number and one special character)
 * @property {string} [avatarUrl] - Optional URL for user's avatar image
 * @property {string} [bio] - Optional short bio (max 500 characters)
 */
const registrationSchema: object = z.object({
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

/**
 * @description Validation schema for user login
 * @type {Object} LoginSchema
 * @property {string} email - User's email address (must be valid format)
 * @property {string} password - User's password (min 8 characters)
 */
const loginSchema: object = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(8).max(128),
});

export { registrationSchema, loginSchema };
