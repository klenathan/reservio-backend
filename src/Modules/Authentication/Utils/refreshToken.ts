import CustomError from "../../../Errors/CustomError";

import { sign, verify, VerifyErrors } from "jsonwebtoken";
import UnauthenticatedError from "@/Errors/UnauthenticatedError";

const refreshTokenPair = (refreshToken: string): readonly [string, string, any] => {
  if (!process.env.JWT_SECRETE || !process.env.JWT_REFRESH_TOKEN_SECRETE) {
    throw new CustomError(
      "UNAVAILABLE_SECRETE_KEY",
      "Please include JWT Secrete key into ENV config file",
      500
    );
  }

  let jwtSecrete = process.env.JWT_SECRETE;
  let jwtRefreshTokenSecrete = process.env.JWT_REFRESH_TOKEN_SECRETE;

  refreshToken = refreshToken.substring(7);

  let decodeUserData = verify(
    refreshToken,
    jwtRefreshTokenSecrete,
    (error: VerifyErrors | null, decoded: any) => {
      if (error) {
        throw new UnauthenticatedError(
          "FAILED_JWT_REFRESH_VERIFY",
          error.message
        );
      }
      return decoded.user;
    }
  );

  const accessToken = sign(
    {
      /// Expire in 1 days
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 1,
      user: decodeUserData,
    },
    jwtSecrete
  );

  const newRefreshToken = sign(
    {
      user: decodeUserData,
    },
    jwtRefreshTokenSecrete
  );
  return [accessToken, newRefreshToken, decodeUserData] as const;
};

export default refreshTokenPair;
