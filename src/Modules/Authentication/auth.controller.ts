import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import BaseController from "../Base/BaseController";

import AuthService from "./auth.service";

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
}
