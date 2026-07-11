import { OrderStatus } from "../../../../generated/prisma/enums";
import type { RentalOrderWhereInput } from "../../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { ICreateRentalPayload, IRentalQuery } from "./rental.interface";

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

  return await prisma.$transaction(async (tx) => {
    let grandTotal = 0;
    const rentalItems = [];

    for (const item of payload.items) {
      const gear = await tx.gearItem.findUniqueOrThrow({
        where: { id: item.gearItemId, isDeleted: false },
      });

      if (!gear.isAvailable || gear.availableStock < item.quantity) {
        throw new AppError(
          400,
          `Insufficient stock for "${gear.name}". Available: ${gear.availableStock}`,
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

      // Reduce available stock
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: {
          availableStock: { decrement: item.quantity },
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
        note: payload.note,
        items: { create: rentalItems },
      },
      include: {
        items: { include: { gearItem: { include: { category: true } } } },
        customer: { omit: { password: true } },
      },
    });

    return rental;
  });
};

const getMyRentals = async (customerId: string, query: IRentalQuery) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  const andCondition: RentalOrderWhereInput[] = [{ customerId }];
  if (query.status) andCondition.push({ status: query.status as OrderStatus });

  const [data, total] = await Promise.all([
    prisma.rentalOrder.findMany({
      where: { AND: andCondition },
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { gearItem: true } },
        payment: true,
      },
    }),
    prisma.rentalOrder.count({ where: { AND: andCondition } }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

const getRentalById = async (
  rentalId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const rental = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalId },
    include: {
      items: { include: { gearItem: { include: { category: true } } } },
      customer: { omit: { password: true } },
      payment: true,
    },
  });

  if (!isAdmin && rental.customerId !== userId) {
    // Provider check — see if any item belongs to this provider
    const providerGearIds = await prisma.gearItem.findMany({
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

const cancelRental = async (rentalId: string, customerId: string) => {
  const rental = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalId },
    include: { items: true },
  });

  if (rental.customerId !== customerId) {
    throw new AppError(403, "You can only cancel your own rentals");
  }

  if (!["PLACED", "CONFIRMED"].includes(rental.status)) {
    throw new AppError(
      400,
      `Cannot cancel a rental with status: ${rental.status}`,
    );
  }

  return await prisma.$transaction(async (tx) => {
    // Restore stock
    for (const item of rental.items) {
      const gear = await tx.gearItem.findUnique({
        where: { id: item.gearItemId },
      });
      if (gear) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
          data: {
            availableStock: { increment: item.quantity },
            isAvailable: true,
          },
        });
      }
    }

    return await tx.rentalOrder.update({
      where: { id: rentalId },
      data: { status: OrderStatus.CANCELLED },
    });
  });
};

// Provider: get incoming orders for their gear
const getProviderOrders = async (providerId: string, query: IRentalQuery) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  const providerGear = await prisma.gearItem.findMany({
    where: { providerId },
    select: { id: true },
  });
  const gearIds = providerGear.map((g) => g.id);

  const andCondition: RentalOrderWhereInput[] = [
    { items: { some: { gearItemId: { in: gearIds } } } },
  ];
  if (query.status) andCondition.push({ status: query.status as OrderStatus });

  const [data, total] = await Promise.all([
    prisma.rentalOrder.findMany({
      where: { AND: andCondition },
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { gearItem: true } },
        customer: { omit: { password: true } },
        payment: true,
      },
    }),
    prisma.rentalOrder.count({ where: { AND: andCondition } }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

const updateOrderStatus = async (
  rentalId: string,
  status: OrderStatus,
  providerId: string,
  isAdmin: boolean,
) => {
  const rental = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalId },
    include: { items: true },
  });

  if (!isAdmin) {
    const providerGear = await prisma.gearItem.findMany({
      where: { providerId },
      select: { id: true },
    });
    const gearIds = providerGear.map((g) => g.id);
    const hasAccess = rental.items.some((item) =>
      gearIds.includes(item.gearItemId),
    );
    if (!hasAccess) throw new AppError(403, "Access denied");
  }

  // Valid status transitions
  const validTransitions: Record<string, OrderStatus[]> = {
    PLACED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    CONFIRMED: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
    PAID: [OrderStatus.PICKED_UP],
    PICKED_UP: [OrderStatus.RETURNED],
  };

  const allowed = validTransitions[rental.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(
      400,
      `Cannot transition from ${rental.status} to ${status}`,
    );
  }

  // Restore stock on return
  if (status === OrderStatus.RETURNED) {
    await prisma.$transaction(async (tx) => {
      for (const item of rental.items) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
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

  return await prisma.rentalOrder.update({
    where: { id: rentalId },
    data: { status },
    include: { items: { include: { gearItem: true } } },
  });
};

export const rentalServices = {
  createRental,
  getMyRentals,
  getRentalById,
  cancelRental,
  getProviderOrders,
  updateOrderStatus,
};
