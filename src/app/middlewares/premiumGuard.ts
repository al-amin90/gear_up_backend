import type { NextFunction, Request, Response } from "express";

import { SubscriptionStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const subscriptionGuard = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId,
      },
    });

    if (!subscription) {
      throw new Error("Please Subcribe to access premium content");
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error("Please subscribe again to access premium content");
    }

    next();
  };
};

export default subscriptionGuard;
