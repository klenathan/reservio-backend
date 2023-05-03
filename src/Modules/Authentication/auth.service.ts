import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { randomUUID } from "crypto";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

import CustomError from "@/Errors/CustomError";
import UnauthenticatedError from "@/Errors/UnauthenticatedError";
import generateTokenPair from "@/Modules/Authentication/Utils/generateTokenPair";
import handleImageUpload from "@/Utils/HandleImages/handleImgUpload";
import BaseService from "../Base/BaseService";
import DTOSignUp from "./Types/DTOSignUp";
import { comparePassword, hashPassword } from "./Utils/passwordUtils";
import sendEmail from "@/Utils/sendEmail";
import generateCode from "@/Utils/generateConfirmationString";
import confirmationEmailTemplate from "@/Utils/emailTemplates/confirmationEmailTemplate";
import axios from "axios";
import validateRefreshToken from "./Utils/validateRefreshToken";
import UserDTO from "./Types/UserDTO";

export default class AuthService extends BaseService {
  private userQuerySelectConfig = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    email: true,
    phoneNo: true,
    avatar: true,
    vendor: true,
    status: true,
    admin: true,
    createdAt: true,
    updatedAt: true,
  };

  public constructor(db: PrismaClient) {
    super(db);
  }

  migrateData = async () => {};

  handleLogin = async (username: string, password: string) => {
    let user = await this.db.user.findFirstOrThrow({
      where: { username: username, status: "ACTIVATE" },
      include: { vendor: true, admin: true },
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

  refreshToken = async (refreshToken: string) => {
    let requestUserData: UserDTO = validateRefreshToken(
      refreshToken
    ) as unknown as UserDTO;

    let userDataQuery = await this.db.user.findFirstOrThrow({
      where: { id: requestUserData.id },
      select: this.userQuerySelectConfig,
    });

    const [newAccessToken, newRefreshToken] = generateTokenPair(userDataQuery);

    return {
      status: "success",
      user: userDataQuery,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
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

    if (!data.email) {
      throw new CustomError("MISSING_FIELD", "Missing email", 400);
    }

    data.avatar = fileName;

    data.password = await hashPassword(data.password);

    const generatedCode = generateCode();

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
          confirmationCode: {create: {confirmCode: generatedCode}}
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
    //// Send Email Service
    const sendData = {
      email: data.email,
      username: data.username,
      code: generatedCode,
    };

     axios
      .post(`${process.env.EMAIL_SERVICE}/confirmation`, sendData)
      .then((r) => {
        // console.log(r);
      })
      .catch((e) => {
        console.log(e);
      });

    const { id: _id, password: _pw, ...returnData } = newUser;
    return returnData;
  };

  validateConfirmation = async (username: string, code: string) => {
    let confirmation = await this.db.confirmationCode.findFirstOrThrow({
      where: { user: { username: username } },
      include: { user: true },
    });

    if (confirmation.confirmCode == code) {
      await this.db.user.update({
        where: { username: confirmation.user.username },
        data: { status: "ACTIVATE" },
      });
    }

    return {
      username: username,
      code: code,
      status: confirmation.confirmCode == code,
    };
  };
}
