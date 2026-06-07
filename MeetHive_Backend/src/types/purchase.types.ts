/**
 * @module src/types/purchase.types.ts
 * @description holds the types declaration for the purchase objects
 */
interface PurchaseTicketsInput {
  ticketTypeId: string;
  quantity: number;
  attendeeEmails: string[];
}

export type { PurchaseTicketsInput };
