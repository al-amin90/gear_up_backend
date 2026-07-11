import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import { reviewControllers } from "./review.controller";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  reviewControllers.createReview,
);

export const reviewRouter = router;
