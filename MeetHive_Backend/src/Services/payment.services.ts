/**
 * @module src/Services/payment.services.ts
 * @description holds the business logic for the payment feature
 */
import prisma from "../config/prisma.js";
import { PaymentStatus } from "@prisma/client";
import { initializePaystack } from "../Utils/paystack.js";
import HttpError from "../Utils/httpError.js";

/**
 * @function initializeOrderPayment
 * @description initializes the payment for an orders
 * @param {string} paymentId - the id of the payment to initialize
 * @param {string} email - the email of the user making the payment
 * @returns {Promise<any>} the result of the payment initialization
 */

const initializeOrderPayment = async ({
  paymentId,
  email,
}: {
  paymentId: string;
  email: string;
}): Promise<{
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}> => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },

    include: {
      order: true,
    },
  });

  if (!payment) {
    throw new HttpError(404, "Payment not found");
  }

  try {
    const paystack = await initializePaystack({
      email,
      amount: Number(payment.amount) * 100,

      reference: payment.order.orderReference,
    });

    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        providerTxId: paystack.reference,
      },
    });

    return paystack;
  } catch (error) {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: PaymentStatus.FAILED,
      },
    });

    throw error;
  }
};

export { initializeOrderPayment };
