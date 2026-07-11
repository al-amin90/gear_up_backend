import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import AppError from "../utils/AppError";
import { Prisma } from "../../../generated/prisma/client";
import status from "http-status";

const GlobalErrorHandler: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Something Went Wrong!";

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "You have Provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 400;
      message = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      message = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = 400;
      message =
        "An operation failed because it depends on one or more records that ware required but not found";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = status.UNAUTHORIZED;
      message =
        "Authentication failed against database server. Please Check Your Credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = status.BAD_REQUEST;
      message = "Can't reach database server";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = "Error Occured during query execution";
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  console.log(":) Global bro", err);

  res.status(statusCode).json({
    success: false,
    message,
    // err,
    stack: err.stack,
  });
};

export default GlobalErrorHandler;
