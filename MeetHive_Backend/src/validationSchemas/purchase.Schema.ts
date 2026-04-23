/**
 * @module src/validationSchemas/purchase.Schema.ts
 * @description Middleware for validation schemas on purchase data using Zod.
 */

import { z } from "zod";

export const purchaseSchema = z.object({
  qty: z.number().int().min(1, "Quantity must be at least 1"),
  attendeeEmails: z.array(z.string().email()).optional(),
});
