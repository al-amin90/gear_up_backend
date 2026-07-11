import { Router } from "express";
import { authControllers } from "./auth.controller";
import { Role } from "../../../../generated/prisma/enums";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/register", authControllers.registerUser);
router.get(
  "/me",
  auth(Role.CUSTOMER, Role.ADMIN, Role.PROVIDER),
  authControllers.getMyProfile,
);
router.post("/login", authControllers.loginUser);
router.post("/refresh-token", authControllers.refreshToken);

export const authRouter = router;
