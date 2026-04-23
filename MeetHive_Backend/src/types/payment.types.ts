/**
 * @module src/types/payment.types.ts
 * @description holds the types declaration for the payment objects
 */

interface InitializePaymentPayload {
  email: string;
  amount: number; // in kobo
  reference: string;
}

interface PaystackInitResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export type { InitializePaymentPayload, PaystackInitResponse };
