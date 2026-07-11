import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import { gearControllers } from "../gear/gear.controller";
import { rentalControllers } from "../rental/rental.controller";

const router = Router();

// gear Management
router.post(
  "/gear",
  auth(Role.PROVIDER, Role.ADMIN),
  gearControllers.createGear,
);

router.put(
  "/gear/:gearId",
  auth(Role.PROVIDER, Role.ADMIN),
  gearControllers.updateGear,
);
router.delete(
  "/gear/:gearId",
  auth(Role.PROVIDER, Role.ADMIN),
  gearControllers.deleteGear,
);

// order mangments
router.get(
  "/orders",
  auth(Role.PROVIDER, Role.ADMIN),
  rentalControllers.getProviderOrders,
);

router.patch(
  "/orders/:rentalId/status",
  auth(Role.PROVIDER, Role.ADMIN),
  rentalControllers.updateOrderStatus,
);

export const providerRouter = router;
