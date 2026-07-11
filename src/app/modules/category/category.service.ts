import { prisma } from "../../../lib/prisma";
import AppError from "../../utils/AppError";
import type { ICreateCategoryPayload } from "./category.interface";

const createCategory = async (payload: ICreateCategoryPayload) => {
  const exists = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (exists) {
    throw new AppError(409, "Category already exists");
  }

  return await prisma.category.create({ data: payload });
};

const getAllCategories = async () => {
  const result = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          gearItems: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return result;
};

const updateCategory = async (
  categoryId: string,
  payload: Partial<ICreateCategoryPayload>,
) => {
  await prisma.category.findUniqueOrThrow({ where: { id: categoryId } });

  const result = await prisma.category.update({
    where: { id: categoryId },
    data: { ...payload },
  });

  return result;
};

const deleteCategory = async (categoryId: string) => {
  await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });

  await prisma.category.delete({ where: { id: categoryId } });
};

export const categoryServices = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
