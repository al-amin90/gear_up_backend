import { OrderStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";

import AppError from "../../utils/AppError";
import type { ICreateReviewPayload } from "./review.interface";

const createReview = async (payload: ICreateReviewPayload, userId: string) => {
  const gearItem = await prisma.gear.findUnique({
    where: { id: payload.gearItemId },
  });

  if (!gearItem) {
    throw new AppError(404, "Gear item not found");
  }

  const completedRental = await prisma.rentalOrder.findMany({
    where: {
      customerId: userId,
      status: OrderStatus.RETURNED,
      items: {
        some: {
          gearItemId: payload.gearItemId,
        },
      },
    },
  });

  if (!completedRental || completedRental.length === 0) {
    throw new AppError(400, "You can only review gear you have returned");
  }

  const existing = await prisma.review.findUnique({
    where: {
      userId_gearItemId: {
        userId,
        gearItemId: payload.gearItemId,
      },
    },
  });

  if (existing) {
    throw new AppError(409, "You have already reviewed this gear");
  }

  const result = await prisma.review.create({
    data: {
      ...payload,
      userId,
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
      gearItem: {
        select: { id: true, name: true },
      },
    },
  });

  return result;
};

export const reviewServices = { createReview };
