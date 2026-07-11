import type { Request, Response } from "express";
import { Role } from "../../../../generated/prisma/enums";
import sendResponse from "../../utils/sendResponse";
import { gearServices } from "./gear.service";

const createGear = async (req: Request, res: Response) => {
  const result = await gearServices.createGear(
    req.body,
    req.user?.id as string,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Gear created successfully",
    data: result,
  });
};

const getAllGear = async (req: Request, res: Response) => {
  const result = await gearServices.getAllGear(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear list retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
};

const getGearById = async (req: Request, res: Response) => {
  const result = await gearServices.getGearById(req.params.gearId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear retrieved successfully",
    data: result,
  });
};

const updateGear = async (req: Request, res: Response) => {
  const result = await gearServices.updateGear(
    req.params.gearId as string,
    req.body,
    req.user?.id as string,
    req.user?.role === Role.ADMIN,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear updated successfully",
    data: result,
  });
};

const deleteGear = async (req: Request, res: Response) => {
  await gearServices.deleteGear(
    req.params.gearId as string,
    req.user?.id as string,
    req.user?.role === Role.ADMIN,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear deleted successfully",
    data: null,
  });
};

const getMyGear = async (req: Request, res: Response) => {
  const result = await gearServices.getMyGear(req.user?.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My gear retrieved successfully",
    data: result,
  });
};

export const gearControllers = {
  createGear,
  getAllGear,
  getGearById,
  updateGear,
  deleteGear,
  getMyGear,
};
