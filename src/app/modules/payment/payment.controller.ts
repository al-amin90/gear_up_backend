import type { Request, Response } from "express";
import { Role } from "../../../../generated/prisma/enums";
import sendResponse from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { paymentServices } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.createPayment(
    req.body.rentalOrderId,
    req.user?.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Stripe checkout session created",
    data: result,
  });
});

const verifySession = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.verifySession(
    req.params?.sessionId as string,
    req.user?.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment verified successfully",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.getMyPayments(req.user?.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment history retrieved successfully",
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.getPaymentById(
    req.params.paymentId as string,
    req.user?.id as string,
    req.user?.role === Role.ADMIN,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const event = req.body;
  const signature = req.headers["stripe-signature"] as string;

  const result = await paymentServices.handleWebhook(
    event as Buffer,
    signature,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Webhook trigger Successfully",
    data: null,
  });
});

export const paymentControllers = {
  createPayment,
  handleWebhook,
  verifySession,
  getMyPayments,
  getPaymentById,
};
