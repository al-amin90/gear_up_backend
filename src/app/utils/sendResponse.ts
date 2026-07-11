import type { Response } from "express";

type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

interface IResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta;
}

const sendResponse = <T>(res: Response, data: IResponse<T>) => {
  const body: Record<string, unknown> = {
    success: data.success,
    message: data.message,
    data: data.data ?? null,
  };

  if (data.meta) body.meta = data.meta;

  res.status(data.statusCode).json(body);
};

export default sendResponse;
