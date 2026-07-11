import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import AppError from "./AppError";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string,
) => {
  const token = jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  } as SignOptions);

  return token;
};

const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.log("Invalid Token", error);
    throw new AppError(500, "Invalid Token");
  }
};
export const jwtUtils = {
  createToken,
  verifyToken,
};
