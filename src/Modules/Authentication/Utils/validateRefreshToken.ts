import CustomError from "../../../Errors/CustomError";

import { verify, VerifyErrors } from "jsonwebtoken";
import UnauthenticatedError from "@/Errors/UnauthenticatedError";
import UserDTO from "../Types/UserDTO";

export default function validateRefreshToken(refreshToken: string) {
  if (!process.env.JWT_REFRESH_TOKEN_SECRETE) {
    throw new CustomError(
      "UNAVAILABLE_SECRETE_KEY",
      "Please include JWT Secrete key into ENV config file",
      500
    );
  }

  let jwtRefreshTokenSecrete = process.env.JWT_REFRESH_TOKEN_SECRETE;

  refreshToken = refreshToken.substring(7);

  return verify(
    refreshToken,
    jwtRefreshTokenSecrete,
    (error: VerifyErrors | null, decoded: any) => {
      if (error) {
        throw new UnauthenticatedError(
          "FAILED_JWT_REFRESH_VERIFY",
          error.message
        );
      }
      return decoded.user as UserDTO;
    }
  );
}
