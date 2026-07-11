import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import { gearControllers } from "./gear.controller";

const router = Router();

router.get("/", gearControllers.getAllGear);
router.get("/:gearId", gearControllers.getGearById);

router.get(
  "/provider/my-gear",
  auth(Role.PROVIDER, Role.ADMIN),
  gearControllers.getMyGear,
);

export const gearRouter = router;
