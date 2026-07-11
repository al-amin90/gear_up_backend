/* eslint-disable @typescript-eslint/no-unused-vars */

import { authServices } from "./auth.service";
import config from "../../config";
import sendResponse from "../../utils/sendResponse";
import type { Request, Response } from "express";

const registerUser = async (req: Request, res: Response) => {
  const { user } = await authServices.registerUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Created Successfully",
    data: { user },
  });
};

const getMyProfile = async (req: Request, res: Response) => {
  const result = await authServices.getUserFromDB(req.user?.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Info Get Successfully",
    data: result,
  });
};

const loginUser = async (req: Request, res: Response) => {
  const result = await authServices.loginUser(req.body);

  const { refreshToken, accessToken } = result;

  res.cookie("accessToken", accessToken, {
    secure: config.node_env === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.cookie("refreshToken", refreshToken, {
    secure: config.node_env === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User is logged in Successfully",
    data: {
      accessToken,
      refreshToken,
    },
  });
};

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const { accessToken } = await authServices.refreshToken(refreshToken);

  res.cookie("accessToken", accessToken, {
    secure: config.node_env === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access Token Retrieved Successfully",
    data: {
      accessToken,
    },
  });
};

const getAllUsers = async (req: Request, res: Response) => {
  const result = await authServices.getAllUsers();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved",
    data: result,
  });
};

const updateUserStatus = async (req: Request, res: Response) => {
  const result = await authServices.updateStatus(
    req.params.userId as string,
    req.body.isActive,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User status updated",
    data: result,
  });
};

export const authControllers = {
  loginUser,
  refreshToken,
  getMyProfile,
  registerUser,
  getAllUsers,
  updateUserStatus,
};
