import UnauthenticatedError from "@/Errors/UnauthenticatedError";
import generateTokenPair from "@/Utils/generateTokenPair";
import { PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";
import { comparePassword } from "./Utils/passwordUtils";

export default class AuthService extends BaseService {
  public constructor(db: PrismaClient) {
    super(db);
  }

  handleLogin = async (username: string, password: string) => {
    let user = await this.db.users.findFirstOrThrow({
      where: { username: username },
    });

    if (!(await comparePassword(password, user.password))) {
      throw new UnauthenticatedError(
        "WRONG_CREDENTIAL",
        `Wrong credential for user ${username}`
      );
    }

    let { password: _, ...returnData } = user;

    const [accessToken, refreshToken] = generateTokenPair(returnData);

    return {
      status: "success",
      user: returnData,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  };
}
