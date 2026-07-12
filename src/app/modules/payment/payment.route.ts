import { Router } from "express";
import express from "express";
import { Role } from "../../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import { paymentControllers } from "./payment.controller";

const router = Router();

router.post("/webhook", paymentControllers.handleWebhook);

router.post("/create", auth(Role.CUSTOMER), paymentControllers.createPayment);

router.get(
  "/verify/:sessionId",
  auth(Role.CUSTOMER),
  paymentControllers.verifySession,
);

router.get(
  "/",
  auth(Role.CUSTOMER, Role.ADMIN),
  paymentControllers.getMyPayments,
);

router.get(
  "/:paymentId",
  auth(Role.CUSTOMER, Role.ADMIN),
  paymentControllers.getPaymentById,
);

export const paymentRouter = router;
