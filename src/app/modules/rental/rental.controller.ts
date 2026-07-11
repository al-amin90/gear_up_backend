import type { Request, Response } from "express";
import { Role, OrderStatus } from "../../../../generated/prisma/enums";
import sendResponse from "../../utils/sendResponse";
import { rentalServices } from "./rental.service";

const createRental = async (req: Request, res: Response) => {
  const result = await rentalServices.createRental(
    req.body,
    req.user?.id as string,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Rental order created successfully",
    data: result,
  });
};

const getAllRentals = async (req: Request, res: Response) => {
  const result = await rentalServices.getAllRentals();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All rentals retrieved",
    data: result,
  });
};

const getMyRentals = async (req: Request, res: Response) => {
  const result = await rentalServices.getMyRentals(
    req.user?.id as string,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My rentals retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
};

const getRentalById = async (req: Request, res: Response) => {
  const result = await rentalServices.getRentalById(
    req.params.rentalId as string,
    req.user?.id as string,
    req.user?.role === Role.ADMIN,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rental retrieved successfully",
    data: result,
  });
};

const getProviderOrders = async (req: Request, res: Response) => {
  const result = await rentalServices.getProviderOrders(
    req.user?.id as string,
    req.query,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Provider orders retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
};

const updateOrderStatus = async (req: Request, res: Response) => {
  const result = await rentalServices.updateOrderStatus(
    req.params.rentalId as string,
    req.body.status as OrderStatus,
    req.user?.id as string,
    req.user?.role === Role.ADMIN,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
};

export const rentalControllers = {
  createRental,
  getMyRentals,
  getRentalById,
  getProviderOrders,
  updateOrderStatus,
  getAllRentals,
};
