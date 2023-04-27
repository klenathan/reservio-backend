import CustomError from "@/Errors/CustomError";
import UnauthenticatedError from "@/Errors/UnauthenticatedError";
import refreshTokenPair from "@/Modules/Authentication/Utils/refreshToken";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { deprecate } from "util";
import BaseController from "../Base/BaseController";

import AuthService from "./auth.service";
import DTOSignUp from "./Types/DTOSignUp";
import { log } from "console";

export default class AuthController extends BaseController {
  declare service: AuthService;
  public constructor(db: PrismaClient) {
    super(db);
    this.service = new AuthService(this.db);
  }

  migrateData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let result = await this.service.migrateData();
      return res.json(result);
    } catch (e) {
      next(e);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let result = await this.service.handleLogin(
        req.body.username,
        req.body.password
      );
      return res.json(result);
    } catch (e) {
      next(e);
    }
  };

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let signUpData: DTOSignUp = req.body;
      let avatar = req.files as unknown as Express.Multer.File[];
      let result = await this.service.handleSignUp(signUpData, avatar[0]);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  };

  tokenRefresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.headers.authorization) {
        throw new UnauthenticatedError(
          "MISSING_TOKEN",
          "Auth token cannot be found on request header"
        );
      }

      // const [accessToken, refreshToken, user] = refreshTokenPair(
      //   req.headers.authorization
      // );

      // return res.status(200).send({
      //   status: "success",
      //   user: user,
      //   accessToken: accessToken,
      //   refreshToken: refreshToken,
      // });
      return res.send(
        await this.service.refreshToken(req.headers.authorization)
      );
    } catch (e) {
      next(e);
    }
  };

  validateConfirmation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const username: string = req.body.username;
      const confirmationCode: string = req.body.code;

      console.log(username, confirmationCode);

      return res.send(
        await this.service.validateConfirmation(username, confirmationCode)
      );
    } catch (e) {
      next(e);
    }
  };

  tokenValidate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.headers.authorization) {
        throw new UnauthenticatedError(
          "MISSING_TOKEN",
          "Auth token cannot be found on request header"
        );
      }
    } catch (e) {
      next(e);
    }
  };
}
