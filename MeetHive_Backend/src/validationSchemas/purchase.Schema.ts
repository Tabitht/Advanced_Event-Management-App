/**
 * @module src/validationSchemas/purchase.Schema.ts
 * @description Middleware for validation schemas on purchase data using Zod.
 */

import { z } from "zod";

/**
 * @description Validation schema for purchasing a ticket
 * @type {Object} PurchaseSchema
 * @property {string} ticketType - The type of ticket to be purchased
 * @property {int} quantity - the number of ticket to be bought
 * @property {array} attendeeEmails - Emails of tickets user buying tickets/ group tickets users email
 */
const PurchaseSchema = z
  .object({
    ticketType: z.string().min(1, "Ticket type is required"),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .min(1, "Quantity must be at least 1"),
    attendeeEmails: z
      .array(z.email("Invalid email address"))
      .min(1, "At least one attendee email is required"),
  })
  .superRefine((data, ctx) => {
    if (data.attendeeEmails && data.attendeeEmails.length > data.quantity) {
      ctx.addIssue({
        code: "custom",
        path: ["attendeeEmails"],
        message: "Attendee emails cannot exceed ticket quantity",
      });
    }
  });

export type PurchaseTicketInput = z.infer<typeof PurchaseSchema>;

export { PurchaseSchema };
