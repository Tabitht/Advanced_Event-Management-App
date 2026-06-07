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
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}
interface PaystackErrorResponse {
  message?: string;
  status?: boolean;
}

export type {
  InitializePaymentPayload,
  PaystackInitResponse,
  PaystackErrorResponse,
};
