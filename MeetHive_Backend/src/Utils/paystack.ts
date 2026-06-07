/*
 * @ module - src/utils/paystack.ts
 * @ description - Utility function for handling Paystack payment initialization.
 */

import {
  InitializePaymentPayload,
  PaystackInitResponse,
  PaystackErrorResponse,
} from "../types/payment.types.js";
import HttpError from "./httpError.js";

/**
 * @function initializePaystack
 * @description Initializes a payment transaction with Paystack and returns the authorization URL,
 *  access code, and reference.
 * @param {InitializePaymentPayload} payload - The payload containing email, amount, and reference
 * for the payment initialization.
 * @returns {Promise<{authorizationUrl: string; accessCode: string; reference: string}>} An object
 * containing the authorization URL, access code, and reference for the initialized payment.
 * @throws {HttpError} Throws an HttpError if the Paystack API call fails.
 */
const initializePaystack = async (
  payload: InitializePaymentPayload
): Promise<{
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}> => {
  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    }
  );
  const result = await response.json();
  if (!response.ok) {
    const errorResponse = result as PaystackErrorResponse;
    throw new HttpError(
      response.status,
      errorResponse.message || "Failed to initialize payment"
    );
  }
  const data = result as PaystackInitResponse;
  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
};

export { initializePaystack };
