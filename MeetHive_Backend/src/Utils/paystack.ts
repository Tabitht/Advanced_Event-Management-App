/**
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
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 20000);

  try {
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      const error = result as PaystackErrorResponse;

      throw new HttpError(
        response.status,
        error.message ?? "Payment initialization failed"
      );
    }

    const data = result as PaystackInitResponse;

    return {
      authorizationUrl: data.data.authorization_url,

      accessCode: data.data.access_code,

      reference: data.data.reference,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new HttpError(504, "Payment provider timeout");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export { initializePaystack };
