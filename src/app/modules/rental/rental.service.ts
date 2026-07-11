import { OrderStatus } from "../../../../generated/prisma/enums";
import type { RentalOrderWhereInput } from "../../../../generated/prisma/models";
import { prisma } from "../../../lib/prisma";

import AppError from "../../utils/AppError";
import type { ICreateRentalPayload } from "./rental.interface";

const createRental = async (
  payload: ICreateRentalPayload,
  customerId: string,
) => {
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (endDate <= startDate) {
    throw new AppError(400, "End date must be after start date");
  }

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const transition = await prisma.$transaction(async (tx) => {
    let grandTotal = 0;
    const rentalItems = [];

    for (const item of payload.items) {
      const gear = await tx.gear.findUniqueOrThrow({
        where: {
          id: item.gearItemId,
          isDeleted: false,
        },
      });

      if (!gear.isAvailable || gear.availableStock < item.quantity) {
        throw new AppError(
          400,
          ` stock out "${gear.name}", Available: ${gear.availableStock}`,
        );
      }

      const subtotal = gear.pricePerDay * item.quantity * totalDays;
      grandTotal += subtotal;

      rentalItems.push({
        gearItemId: item.gearItemId,
        quantity: item.quantity,
        pricePerDay: gear.pricePerDay,
        subtotal,
      });

      // Reduce the stock
      await tx.gear.update({
        where: {
          id: item.gearItemId,
        },

        data: {
          availableStock: {
            decrement: item.quantity,
          },
          isAvailable: gear.availableStock - item.quantity > 0,
        },
      });
    }

    const rental = await tx.rentalOrder.create({
      data: {
        customerId,
        startDate,
        endDate,
        totalDays,
        totalAmount: grandTotal,
        items: {
          create: rentalItems,
        },
      },

      include: {
        items: {
          include: {
            gears: true,
          },
        },

        customer: {
          omit: {
            password: true,
          },
        },
      },
    });

    return rental;
  });

  return transition;
};

const getMyRentals = async (customerId: string, query: any) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  const andCondition: RentalOrderWhereInput[] = [];

  andCondition.push({
    customerId,
  });
  if (query.status) {
    andCondition.push({
      status: query.status as OrderStatus,
    });
  }

  const [data, total] = await Promise.all([
    prisma.rentalOrder.findMany({
      where: { AND: andCondition },
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { gears: true } },
        payment: true,
      },
    }),
    prisma.rentalOrder.count({ where: { AND: andCondition } }),
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

const getAllRentals = async () => {
  const result = await prisma.rentalOrder.findMany({
    include: {
      customer: {
        omit: {
          password: true,
        },
      },

      items: {
        include: {
          gears: true,
        },
      },
      payment: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getRentalById = async (rentalId: string, userId: string) => {
  const rental = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalId },
    include: {
      items: { include: { gears: { include: { category: true } } } },
      customer: { omit: { password: true } },
      payment: true,
    },
  });

  if (rental.customerId !== userId) {
    const providerGearIds = await prisma.gear.findMany({
      where: { providerId: userId },
      select: { id: true },
    });

    const providerIds = providerGearIds.map((g) => g.id);

    const hasAccess = rental.items.some((item) =>
      providerIds.includes(item.gearItemId),
    );

    if (!hasAccess) throw new AppError(403, "Access denied");
  }

  return rental;
};

const getProviderOrders = async (providerId: string, query: any) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  const providerGear = await prisma.gear.findMany({
    where: {
      providerId,
    },

    select: {
      id: true,
    },
  });

  const gearIds = providerGear.map((g) => g.id);

  const andCondition: RentalOrderWhereInput[] = [
    {
      items: {
        some: {
          gearItemId: {
            in: gearIds,
          },
        },
      },
    },
  ];

  if (query.status) {
    andCondition.push({ status: query.status as OrderStatus });
  }

  const [data, total] = await Promise.all([
    prisma.rentalOrder.findMany({
      where: {
        AND: andCondition,
      },
      take: limit,
      skip,
      orderBy: {
        createdAt: "desc",
      },

      include: {
        items: {
          include: {
            gears: true,
          },
        },
        customer: {
          omit: {
            password: true,
          },
        },
        payment: true,
      },
    }),

    prisma.rentalOrder.count({
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

const updateOrderStatus = async (
  rentalId: string,
  status: OrderStatus,
  providerId: string,
  isAdmin: boolean,
) => {
  const rental = await prisma.rentalOrder.findUniqueOrThrow({
    where: {
      id: rentalId,
    },

    include: {
      items: true,
    },
  });

  if (!isAdmin) {
    const providerGear = await prisma.gear.findMany({
      where: {
        providerId,
      },
    });

    const gearIds = providerGear.map((g) => g.id);

    const hasAccess = rental.items.some((item) =>
      gearIds.includes(item.gearItemId),
    );

    if (!hasAccess) {
      throw new AppError(403, "Access denied");
    }
  }

  // Restore stock on return
  if (status === OrderStatus.RETURNED) {
    await prisma.$transaction(async (tx) => {
      for (const item of rental.items) {
        await tx.gear.update({
          where: {
            id: item.gearItemId,
          },
          data: {
            availableStock: { increment: item.quantity },
            isAvailable: true,
          },
        });
      }

      await tx.rentalOrder.update({
        where: { id: rentalId },
        data: { status },
      });
    });

    return await prisma.rentalOrder.findUnique({ where: { id: rentalId } });
  }

  const result = await prisma.rentalOrder.update({
    where: {
      id: rentalId,
    },
    data: {
      status,
    },

    include: {
      items: {
        include: {
          gears: true,
        },
      },
    },
  });

  return result;
};

export const rentalServices = {
  createRental,
  getMyRentals,
  getRentalById,
  getProviderOrders,
  updateOrderStatus,
  getAllRentals,
};
