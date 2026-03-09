/**
 * @module src/validationSchemas/event.Schema.ts
 * @description Middleware for validation schemas on event data using Zod.
 */

import * as z from "zod";

/**
 * @description Validation schema for creating an event
 * @type {Object} createEventSchema
 * @property {string} title - Event title (min 5 characters, max 200 characters)
 * @property {string} description - Event description (min 10 characters, max 5000 characters)
 * @property {string} location - Event location (min 5 characters, max 300 characters)
 * @property {string} category - Event category (min 3 characters, max 100 characters)
 * @property {DateTime} startAt - Event start date and time (must be a valid future date)
 * @property {DateTime} endAt - Event end date and time (must be after startAt)
 * @property {int} capacity - Maximum number of attendees (must be a positive integer)
 * @property {boolean} isPublished - Event published status
 */
const createEventSchema = z
  .object({
    title: z.string().trim().min(5).max(200),
    description: z.string().trim().min(10).max(5000),
    location: z.string().trim().min(5).max(300),
    category: z.string().trim().min(3).max(100),
    startAt: z.coerce.date().refine((date) => date > new Date(), {
      message: "Start date must be in the future",
    }),
    endAt: z.coerce.date(),
    capacity: z.number().int().positive().max(100000),
    isPublished: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.endAt <= data.startAt) {
      ctx.addIssue({
        path: ["endAt"],
        message: "End date must be after start date",
        code: z.ZodIssueCode.custom,
      });
    }
  });

/**
 * @description Validation schema for updating an event
 * @type {Object} updateEventSchema
 * @property {string} [title] - Event title (min 5 characters, max 200 characters)
 * @property {string} [description] - Event description (min 10 characters, max 5000 characters)
 * @property {string} [location] - Event location (min 5 characters, max 300 characters)
 * @property {string} [category] - Event category (min 3 characters, max 100 characters)
 * @property {DateTime} [startAt] - Event start date and time (must be a valid future date)
 * @property {DateTime} [endAt] - Event end date and time (must be after startAt)
 * @property {int} [capacity] - Maximum number of attendees (must be a positive integer)
 * @property {boolean} [isPublished] - Event published status
 */
const updateEventSchema = z
  .object({
    title: z.string().trim().min(5).max(200).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    location: z.string().trim().min(5).max(300).optional(),
    category: z.string().trim().min(3).max(100).optional(),
    startAt: z.coerce
      .date()
      .refine((date) => date > new Date(), {
        message: "Start date must be in the future",
      })
      .optional(),
    endAt: z.coerce.date().optional(),
    capacity: z.number().int().positive().max(100000).optional(),
    isPublished: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startAt && data.endAt && data.endAt <= data.startAt) {
      ctx.addIssue({
        path: ["endAt"],
        message: "End date must be after start date",
        code: z.ZodIssueCode.custom,
      });
    }
  });

/**
 * @description Validation schema for publishing an event
 * @type {Object} publishEventSchema
 * @property {string} id - Event ID
 * @property {string} title - Event title (min 5 characters)
 * @property {string} description - Event description (min 10 characters)
 * @property {DateTime} startAt - Event start date and time (must be a valid future date at least 1 hour from now)
 * @property {DateTime} endAt - Event end date and time (must be after startAt)
 * @property {int} capacity - Maximum number of attendees (must be a positive integer)
 */
const publishEventSchema = z
  .object({
    id: z.string(), // event id to publish
    title: z.string().trim().min(5),
    description: z.string().trim().min(10),
    startAt: z.coerce.date().refine((date) => date > new Date(), {
      message: "Start date must be in the future",
    }),
    endAt: z.coerce.date(),
    capacity: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.endAt <= data.startAt) {
      ctx.addIssue({
        path: ["endAt"],
        message: "End date must be after start date",
        code: z.ZodIssueCode.custom,
      });
    }

    const minStartTime = new Date();
    minStartTime.setHours(minStartTime.getHours() + 1); // at least 1h from now
    if (data.startAt < minStartTime) {
      ctx.addIssue({
        path: ["startAt"],
        message: "Event must start at least 1 hour from now",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export { createEventSchema, updateEventSchema, publishEventSchema };
