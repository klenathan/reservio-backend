import CustomError from "@/Errors/CustomError";
import UnauthenticatedError from "@/Errors/UnauthenticatedError";
import refreshTokenPair from "@/Utils/refreshToken";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { deprecate } from "util";
import BaseController from "../Base/BaseController";

import AuthService from "./auth.service";
import DTOSignUp from "./Types/DTOSignUp";

export default class AuthController extends BaseController {
  declare service: AuthService;
  public constructor(db: PrismaClient) {
    super(db);
    this.service = new AuthService(this.db);
  }

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

      const [accessToken, refreshToken] = refreshTokenPair(
        req.headers.authorization
      );
      return res
        .status(200)
        .send({ accessToken: accessToken, refreshToken: refreshToken });
    } catch (e) {
      next(e);
    }
  };

  // @deprecate
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
