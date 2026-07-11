import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import { gearControllers } from "../gear/gear.controller";

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

export const providerRouter = router;
