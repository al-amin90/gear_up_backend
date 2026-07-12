import { Router } from "express";
import express from "express";
import { Role } from "../../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import { paymentControllers } from "./payment.controller";

const router = Router();

router.post(
  "/create",
  auth(Role.CUSTOMER, Role.ADMIN, Role.PROVIDER),
  paymentControllers.createPayment,
);

router.get(
  "/verify/:sessionId",
  auth(Role.CUSTOMER, Role.ADMIN, Role.PROVIDER),
  paymentControllers.verifySession,
);

router.get(
  "/",
  auth(Role.CUSTOMER, Role.ADMIN, Role.PROVIDER),
  paymentControllers.getMyPayments,
);

router.get(
  "/:paymentId",
  auth(Role.CUSTOMER, Role.ADMIN, Role.PROVIDER),
  paymentControllers.getPaymentById,
);

router.post(
  "/webhook",
  express.raw({ type: "*/*" }),
  paymentControllers.handleWebhook,
);

export const paymentRouter = router;
