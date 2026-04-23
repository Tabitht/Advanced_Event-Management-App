/**
 * @module src/Utils/generateReference.ts
 * @description Utility functions for creating a reference string for payment.
 */

import crypto from "crypto";

export const generateOrderReference = (): string => {
  return crypto.randomUUID();
};
