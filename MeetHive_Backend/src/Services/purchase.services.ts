/**
 * @module src/Services/purchase.services.ts
 * @description business logic for the purchase feature
 */

import { PaymentProvider, PaymentStatus, Event, Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { PurchaseTicketsInput } from "../types/purchase.types.js";
import { generateOrderReference } from "../Utils/generateReference.js";
import { initializeOrderPayment } from "./payment.services.js";
import HttpError from "../Utils/httpError.js";

/**
 * @function validateEvent
 * @description checks if the event is valid for ticket purchase
 * @param {string} eventId - the id of the event to validate
 * @returns {Promise<Event>} the event object if valid, otherwise throws an error
 */
const validateEvent = async (eventId: string): Promise<Event> => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) {
    throw new HttpError(404, "Event not found");
  }
  if (event.isArchived || !event.isPublished) {
    throw new HttpError(400, "Event is not available for purchase");
  }
  if (new Date(event.endAt) < new Date()) {
    throw new HttpError(
      400,
      "Could not purchase ticket, event has already ended"
    );
  }
  return event;
};

/**
 * @function initializeTicketPurchase
 * @description handles the logic for initializing a ticket purchase for an event, including
 * validating the event, checking ticket availability, creating an order and initiating payment.
 * @param {string} userId - the id of the user making the purchase
 * @param {string} eventId - the id of the event for which tickets are being purchased
 * @param {Object} purchaseData - the details of the purchase including ticketTypeId, quantity
 * and attendeeEmails
 * @returns {Promise<{transactionResult: {order: Order; orderItem: OrderItem; payment: Payment}; success: boolean; message: string}>} the result of the purchase transaction, success status and message
 */
const initializeTicketPurchase = async ({
  userId,
  eventId,
  ...purchaseData
}: PurchaseTicketsInput & { userId: string; eventId: string }): Promise<{
  result: { authorizationUrl: string; accessCode: string; reference: string };
  success: boolean;
  message: string;
}> => {
  const event = await validateEvent(eventId);
  if (!userId || !purchaseData.quantity || !purchaseData.ticketTypeId) {
    throw new HttpError(400, "missing required fields for ticket purchase");
  }

  const transactionResult = await prisma.$transaction(
    async (transaction) => {
      const ticketType = await transaction.eventTicketType.findUnique({
        where: { id: purchaseData.ticketTypeId },
      });
      if (!ticketType) {
        throw new HttpError(404, "Ticket type not found");
      }
      if (event.id !== ticketType.eventId) {
        throw new HttpError(
          400,
          "Ticket type does not belong to the specified event"
        );
      }
      const ticketAvailability =
        ticketType.quantity - ticketType.sold - ticketType.reserved;
      if (ticketAvailability < purchaseData.quantity) {
        throw new HttpError(400, "Not enough tickets available");
      }
      const price = ticketType.price * purchaseData.quantity;
      const orderReference = generateOrderReference();
      await transaction.eventTicketType.update({
        where: {
          id: ticketType.id,
        },
        data: {
          reserved: {
            increment: purchaseData.quantity,
          },
        },
      });
      const order = await transaction.order.create({
        data: {
          userId,
          organizerId: event.organizerId,
          eventId: event.id,
          orderReference,
          totalAmount: price,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Order expires in 15 minutes
        },
      });
      await transaction.orderItem.create({
        data: {
          orderId: order.id,
          ticketTypeId: purchaseData.ticketTypeId,
          quantity: purchaseData.quantity,
          unitPrice: ticketType.price,
          totalPrice: price,
        },
      });
      const payment = await transaction.payment.create({
        data: {
          orderId: order.id,
          provider: PaymentProvider.PAYSTACK,
          amount: price,
          currency: order.currency,
          status: PaymentStatus.PENDING,
        },
      });
      return {
        payment,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
  const result = await initializeOrderPayment({
    paymentId: transactionResult.payment.id,
    email: purchaseData.attendeeEmails[0]!,
  });
  return {
    result,
    success: true,
    message: "Payment Initiated Successfully, Proceed to Payment Provider",
  };
};

export { initializeTicketPurchase };
