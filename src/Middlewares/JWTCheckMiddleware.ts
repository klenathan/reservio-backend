import CustomError from "@/Errors/CustomError";
import UnauthenticatedError from "@/Errors/UnauthenticatedError";
import { NextFunction, Request, Response } from "express";
import { sign, verify, VerifyErrors } from "jsonwebtoken";

export function JWTCheckMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!process.env.JWT_SECRETE || !process.env.JWT_REFRESH_TOKEN_SECRETE) {
    throw new CustomError(
      "ENV_ERR",
      "Please include JWT Secrete key into ENV config file",
      500
    );
  }
  const jwt_secrete = process.env.JWT_SECRETE;
  let accessToken = req.headers.authorization?.substring(7);

  if (!accessToken) {
    req.body.user = null;
    return next();
  }

  return verify(
    accessToken,
    jwt_secrete,
    (error: VerifyErrors | null, decoded: any) => {
      if (error) {
        return next(
          new UnauthenticatedError("FAILED_JWT_VERIFY", error.message)
        );
      }
      req.body.user = decoded.user;
      return next();
    }
  );
}
