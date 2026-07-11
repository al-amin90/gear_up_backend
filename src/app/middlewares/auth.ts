import type { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import type { JwtPayload } from "jsonwebtoken";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../utils/AppError";
import { prisma } from "../../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: Role;
      };
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(403, "You are not Loged in!");
    }
    console.log(token);

    const verifiedToken = jwtUtils.verifyToken(
      token,
      config.access_token,
    ) as JwtPayload;

    const { id, email, role, name } = verifiedToken;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(403, "You are not authorized!");
    }

    const user = await prisma.user.findUnique({
      where: { id, email, role, name },
    });

    if (!user) {
      throw new AppError(403, "User Not found! Logged in");
    }

    if (!user.isActive) {
      throw new AppError(403, "You are Not Active");
    }

    req.user = {
      id,
      email,
      role,
      name,
    };

    next();
  };
};

export default auth;
