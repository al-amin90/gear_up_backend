import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import config from "../../config";
import AppError from "../../utils/AppError";
import type { TLoginUser } from "./auth.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Role } from "../../../../generated/prisma/enums";
import { jwtUtils } from "../../utils/jwt";

type IUser = {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string | null;
  address?: string;
};

const registerUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role, phone, address } = payload;

  const isExisted = await prisma.user.findUnique({
    where: { email },
  });

  if (isExisted) {
    throw new AppError(500, "user already exists");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      role,
      phone,
      address,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email,
    },
    omit: { password: true },
    // include: {
    //   profile: true,
    // },
  });
  return { user };
};

const getUserFromDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    omit: { password: true },
    // include: {
    //   profile: true,
    // },
  });
  return user;
};

const loginUser = async (payload: TLoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  if (!user.isActive) {
    throw new AppError(403, "You are Not Active");
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new AppError(403, "Password do not match");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.access_token,
    config.access_expires_in,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.refresh_token,
    config.refresh_expires_in,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (refreshToken: string) => {
  const verifiedToken = jwtUtils.verifyToken(
    refreshToken,
    config.refresh_token,
  );

  console.log("verifiedToken", verifiedToken);

  const { id } = verifiedToken as JwtPayload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  if (!user.isActive) {
    throw new AppError(403, "You are Not Active");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.access_token,
    config.access_expires_in,
  );

  return { accessToken };
};

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    omit: {
      password: true,
    },

    include: {
      _count: {
        select: {
          rentals: true,
          gearItems: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const updateStatus = async (userId: string, isActive: boolean) => {
  const result = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      isActive,
    },
    omit: {
      password: true,
    },
  });

  return result;
};

export const authServices = {
  loginUser,
  refreshToken,
  getUserFromDB,
  registerUserIntoDB,
  getAllUsers,
  updateStatus,
};
