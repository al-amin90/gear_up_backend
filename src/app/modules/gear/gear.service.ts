import type { GearWhereInput } from "../../../../generated/prisma/models";
import { prisma } from "../../../lib/prisma";

import AppError from "../../utils/AppError";
import type { ICreateGearPayload } from "./gear.interface";

const createGear = async (payload: ICreateGearPayload, providerId: string) => {
  await prisma.category.findUniqueOrThrow({
    where: {
      id: payload.categoryId,
    },
  });

  const result = await prisma.gear.create({
    data: {
      ...payload,
      availableStock: payload.stock,
      providerId,
    },
    include: {
      category: true,
      provider: {
        omit: {
          password: true,
        },
      },
    },
  });

  return result;
};

const getAllGear = async (query: any) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andCondition: GearWhereInput[] = [
    { isDeleted: false },
    { isAvailable: true },
  ];

  if (query.searchTerm) {
    andCondition.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
        { brand: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.categoryId) {
    andCondition.push({ categoryId: query.categoryId });
  }
  if (query.brand) {
    andCondition.push({
      brand: { contains: query.brand, mode: "insensitive" },
    });
  }
  if (query.minPrice) {
    andCondition.push({ pricePerDay: { gte: Number(query.minPrice) } });
  }
  if (query.maxPrice) {
    andCondition.push({ pricePerDay: { lte: Number(query.maxPrice) } });
  }

  const [data, total] = await Promise.all([
    prisma.gear.findMany({
      where: {
        AND: andCondition,
      },
      take: limit,
      skip,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        category: true,
        provider: {
          omit: {
            password: true,
          },
        },
      },
    }),

    prisma.gear.count({
      where: {
        AND: andCondition,
      },
    }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getGearById = async (gearId: string) => {
  const gear = await prisma.gear.findUniqueOrThrow({
    where: {
      id: gearId,
      isDeleted: false,
    },

    include: {
      category: true,
      provider: {
        omit: {
          password: true,
        },
      },
      reviews: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return gear;
};

const updateGear = async (
  gearId: string,
  payload: Partial<ICreateGearPayload>,
  providerId: string,
  isAdmin: boolean,
) => {
  const gear = await prisma.gear.findUniqueOrThrow({
    where: {
      id: gearId,
      isDeleted: false,
    },
  });

  if (!isAdmin && gear.providerId !== providerId) {
    throw new AppError(403, "You are not authorized to update this gear");
  }

  const result = await prisma.gear.update({
    where: { id: gearId },
    data: payload,
    include: { category: true },
  });

  return result;
};

const deleteGear = async (
  gearId: string,
  providerId: string,
  isAdmin: boolean,
) => {
  const gear = await prisma.gear.findUniqueOrThrow({
    where: {
      id: gearId,
      isDeleted: false,
    },
  });

  if (!isAdmin && gear.providerId !== providerId) {
    throw new AppError(403, "You are not authorized to delete this gear");
  }

  await prisma.gear.update({
    where: {
      id: gearId,
    },
    data: {
      isDeleted: true,
      isAvailable: false,
    },
  });
};

const getMyGear = async (providerId: string) => {
  return await prisma.gear.findMany({
    where: { providerId, isDeleted: false },
    include: {
      category: true,
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const gearServices = {
  createGear,
  getAllGear,
  getGearById,
  updateGear,
  deleteGear,
  getMyGear,
};
