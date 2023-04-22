import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { randomUUID } from "crypto";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

import CustomError from "@/Errors/CustomError";
import UnauthenticatedError from "@/Errors/UnauthenticatedError";
import generateTokenPair from "@/Utils/generateTokenPair";
import handleImageUpload from "@/Utils/HandleImages/handleImgUpload";
import BaseService from "../Base/BaseService";
import DTOSignUp from "./Types/DTOSignUp";
import { comparePassword, hashPassword } from "./Utils/passwordUtils";
import sendEmail from "@/Utils/sendEmail";

export default class AuthService extends BaseService {
  public constructor(db: PrismaClient) {
    super(db);
  }

  handleLogin = async (username: string, password: string) => {
    let user = await this.db.user.findFirstOrThrow({
      where: { username: username, status: "ACTIVATE" },
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

  generateCode = () => {
    const length = 6;
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  handleSignUp = async (
    data: DTOSignUp,
    avatar: Express.Multer.File | undefined
  ) => {
    let fileName: string;
    if (!avatar) {
      fileName = "null";
    } else {
      fileName = `avatar/${randomUUID()}-${avatar.originalname}`;
    }
    data.avatar = fileName;

    data.password = await hashPassword(data.password);

    const generatedCode = this.generateCode();

    /// Create on database
    let newUser = await this.db.user
      .create({
        data: {
          username: data.username,
          firstName: data.username,
          password: data.password,
          email: data.email || "",
          phoneNo: data.phone || "",
          avatar: data.avatar,
          confirmationCode: { create: { confirmCode: generatedCode } },
        } as Prisma.UserCreateInput,
      })
      .then(async (r) => {
        if (avatar) {
          await handleImageUpload(avatar, fileName);
        }

        return r;
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code == "P2002") {
            throw new CustomError("UNIQUE_CONSTRAIN_VIOLATED", e.message, 400);
          }
          throw new CustomError(e.code, e.message, 422);
        }
        throw e;
      });

    /// Send E-mail
    await sendEmail("rmit.clubapp@gmail.com", generatedCode);
    const { id: _id, password: _pw, ...returnData } = newUser;
    return returnData;
  };
}
