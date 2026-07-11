import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import { categoryControllers } from "./category.controller";

const router = Router();

router.get("/", categoryControllers.getAllCategories);

router.post("/", auth(Role.ADMIN), categoryControllers.createCategory);

router.patch(
  "/:categoryId",
  auth(Role.ADMIN),
  categoryControllers.updateCategory,
);

router.delete(
  "/:categoryId",
  auth(Role.ADMIN),
  categoryControllers.deleteCategory,
);

export const categoryRouter = router;
