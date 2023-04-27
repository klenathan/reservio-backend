
import CustomError from "../../../Errors/CustomError";
import { sign } from "jsonwebtoken";

const generateTokenPair = (userData: any): readonly [string, string] => {
  if (!process.env.JWT_SECRETE || !process.env.JWT_REFRESH_TOKEN_SECRETE) {
    throw new CustomError(
      "UNAVAILABLE_SECRETE_KEY",
      "Please include JWT Secrete key into ENV config file",
      500
    );
  }

  let jwt_secrete = process.env.JWT_SECRETE || "";
  let jwtRefreshTokenSecrete = process.env.JWT_REFRESH_TOKEN_SECRETE || "";
  const accessToken = sign(
    {
      /// Expire in 1 days
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 1,
      user: userData,
    },
    jwt_secrete
  );

  const refreshToken = sign(
    {
      user: userData,
    },
    jwtRefreshTokenSecrete
  );
  return [accessToken, refreshToken] as const;
};

export default generateTokenPair;
