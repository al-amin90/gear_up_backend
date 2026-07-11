import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { categoryServices } from "./category.service";

const createCategory = async (req: Request, res: Response) => {
  const result = await categoryServices.createCategory(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result,
  });
};

const getAllCategories = async (req: Request, res: Response) => {
  const result = await categoryServices.getAllCategories();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
};

const updateCategory = async (req: Request, res: Response) => {
  const result = await categoryServices.updateCategory(
    req.params.categoryId as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
};

const deleteCategory = async (req: Request, res: Response) => {
  await categoryServices.deleteCategory(req.params.categoryId as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: null,
  });
};

export const categoryControllers = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
