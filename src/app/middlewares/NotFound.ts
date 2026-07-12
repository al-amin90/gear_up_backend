/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextFunction, type Request, type Response } from "express";

const NotFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found!",
    errorDetails: req.originalUrl,
  });
};

export default NotFound;
