import { PrismaClient } from "@prisma/client";

import BaseRouter from "../Base/BaseRouter";
import AuthController from "./auth.controller";

export default class AuthRouter extends BaseRouter {
  declare a: any;

  public constructor(db: PrismaClient) {
    super(db);

    let authController = new AuthController(db);
    this.router.post("/login", authController.login);
    this.router.post("/signup");
    this.router.post("/token/refresh");
    this.router.post("/token/validate");
  }
}
