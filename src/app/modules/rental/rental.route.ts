import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import { rentalControllers } from "./rental.controller";

const router = Router();

// Customer
router.post(
  "/",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  rentalControllers.createRental,
);
router.get(
  "/my-rentals",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  rentalControllers.getMyRentals,
);

// Provider
router.get(
  "/provider/orders",
  auth(Role.PROVIDER, Role.ADMIN),
  rentalControllers.getProviderOrders,
);
router.patch(
  "/provider/orders/:rentalId/status",
  auth(Role.PROVIDER, Role.ADMIN),
  rentalControllers.updateOrderStatus,
);

// Any authenticated
router.get(
  "/:rentalId",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  rentalControllers.getRentalById,
);

export const rentalRouter = router;
