import type Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import { OrderStatus, PaymentStatus } from "../../../../generated/prisma/enums";

export const paymentComplete = async (session: Stripe.Checkout.Session) => {
  const { rentalOrderId } = session.metadata as { rentalOrderId: string };

  const transitionResult = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        rentalOrderId,
      },

      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: session.payment_intent as string,
        paidAt: new Date(),
      },
    });

    await tx.rentalOrder.update({
      where: {
        id: rentalOrderId,
      },

      data: {
        status: OrderStatus.PAID,
      },
    });
  });
};

export const handleChangeSubscription = async (
  session: Stripe.Checkout.Session,
) => {
  const { rentalOrderId } = session.metadata as { rentalOrderId: string };

  await prisma.payment.update({
    where: {
      rentalOrderId,
    },
    data: {
      status: PaymentStatus.FAILED,
    },
  });
};
