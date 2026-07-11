import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import { rentalControllers } from "../rental/rental.controller";
import { gearControllers } from "../gear/gear.controller";
import { authControllers } from "../auth/auth.controller";

const router = Router();

router.get("/users", auth(Role.ADMIN), authControllers.getAllUsers);

router.patch(
  "/users/:userId",
  auth(Role.ADMIN),
  authControllers.updateUserStatus,
);

router.get(
  "/gear",
  auth(Role.ADMIN),
  gearControllers.getAllGearWithoutPagination,
);

router.get("/rentals", auth(Role.ADMIN), rentalControllers.getAllRentals);

export const adminRouter = router;
