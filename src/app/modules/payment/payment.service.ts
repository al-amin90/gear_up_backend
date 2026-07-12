import Stripe from "stripe";
import { OrderStatus, PaymentStatus } from "../../../../generated/prisma/enums";

import AppError from "../../utils/AppError";
import { prisma } from "../../../lib/prisma";
import { stripe } from "../../../lib/stripe";
import config from "../../config";

const createPayment = async (rentalOrderId: string, userId: string) => {
  const transitionResult = await prisma.$transaction(async (tx) => {
    const rental = await tx.rentalOrder.findUniqueOrThrow({
      where: {
        id: rentalOrderId,
      },

      include: {
        customer: true,
        payment: true,
        items: {
          include: {
            gears: true,
          },
        },
      },
    });

    if (rental.customerId !== userId) {
      throw new AppError(403, "Access denied");
    }

    if (rental.payment?.status === PaymentStatus.COMPLETED) {
      throw new AppError(400, "This rental is already paid");
    }

    const lineItems = rental.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.gears.name,
          description: `${item.quantity} × ${item.gears.brand} — ${rental.totalDays} day(s)`,
        },
        unit_amount: Math.round(item.pricePerDay * 100),
      },
      quantity: item.quantity * rental.totalDays,
    }));

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      customer_email: rental.customer.email,
      payment_method_types: ["card"],

      success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.app_url}/payment/cancel`,
      metadata: {
        rentalOrderId: rental.id,
        userId,
      },
    });

    const result = await tx.payment.upsert({
      where: {
        rentalOrderId: rental.id,
      },

      create: {
        rentalOrderId: rental.id,
        userId,
        amount: rental.totalAmount,
        sessionId: session.id,
        status: PaymentStatus.PENDING,
      },
      update: {
        sessionId: session.id,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      paymentUrl: session.url,
      sessionId: session.id,
      payment: result,
    };
  });

  return transitionResult;
};

// Called by Stripe Webhook — most reliable approach
const handleWebhook = async (rawBody: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch {
    throw new AppError(400, "Invalid webhook signature");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { rentalOrderId } = session.metadata as { rentalOrderId: string };

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { rentalOrderId },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: session.payment_intent as string,
          paidAt: new Date(),
        },
      });
      await tx.rentalOrder.update({
        where: { id: rentalOrderId },
        data: { status: OrderStatus.PAID },
      });
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { rentalOrderId } = session.metadata as { rentalOrderId: string };

    await prisma.payment.update({
      where: { rentalOrderId },
      data: { status: PaymentStatus.FAILED },
    });
  }

  return { received: true };
};

// Verify payment on success page (frontend calls this)
const verifySession = async (sessionId: string, userId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new AppError(400, "Payment not completed");
  }

  const { rentalOrderId } = session.metadata as { rentalOrderId: string };

  const payment = await prisma.payment.findUnique({
    where: { rentalOrderId },
    include: {
      rentalOrder: {
        include: { items: { include: { gearItem: true } } },
      },
    },
  });

  if (!payment) throw new AppError(404, "Payment record not found");
  if (payment.userId !== userId) throw new AppError(403, "Access denied");

  return payment;
};

const getMyPayments = async (userId: string) => {
  return await prisma.payment.findMany({
    where: { userId },
    include: {
      rentalOrder: {
        include: { items: { include: { gearItem: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (
  paymentId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: {
      rentalOrder: { include: { items: { include: { gearItem: true } } } },
    },
  });

  if (!isAdmin && payment.userId !== userId) {
    throw new AppError(403, "Access denied");
  }

  return payment;
};

export const paymentServices = {
  createPayment,
  handleWebhook,
  verifySession,
  getMyPayments,
  getPaymentById,
};
