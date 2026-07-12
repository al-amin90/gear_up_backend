import type { Request, Response } from "express";
import { Role } from "../../../../generated/prisma/enums";
import sendResponse from "../../utils/sendResponse";
import { paymentServices } from "./payment.service";

const createPayment = async (req: Request, res: Response) => {
  const result = await paymentServices.createPayment(
    req.body,
    req.user?.id as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Stripe checkout session created",
    data: result,
  });
};

// Webhook — raw body required
const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const result = await paymentServices.handleWebhook(
    req.body as Buffer,
    signature,
  );
  res.json(result);
};

// Frontend calls after redirect from Stripe success_url
const verifySession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const result = await paymentServices.verifySession(
    sessionId,
    req.user?.id as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment verified successfully",
    data: result,
  });
};

const getMyPayments = async (req: Request, res: Response) => {
  const result = await paymentServices.getMyPayments(req.user?.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment history retrieved successfully",
    data: result,
  });
};

const getPaymentById = async (req: Request, res: Response) => {
  const result = await paymentServices.getPaymentById(
    req.params.paymentId,
    req.user?.id as string,
    req.user?.role === Role.ADMIN,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
};

export const paymentControllers = {
  createPayment,
  handleWebhook,
  verifySession,
  getMyPayments,
  getPaymentById,
};
