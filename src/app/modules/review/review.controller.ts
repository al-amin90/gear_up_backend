import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { reviewServices } from "./review.service";

const createReview = async (req: Request, res: Response) => {
  const result = await reviewServices.createReview(
    req.body,
    req.user?.id as string,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
};

export const reviewControllers = { createReview };
