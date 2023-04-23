import { JWTValidatorMiddleware } from "@/Middlewares/JWTValidatorMiddleware";
import { PrismaClient } from "@prisma/client";

import BaseRouter from "../Base/BaseRouter";
import AuthController from "./auth.controller";

export default class AuthRouter extends BaseRouter {
  declare a: any;

  public constructor(db: PrismaClient) {
    super(db);

    let authController = new AuthController(db);
    this.router.get("/migration", authController.migrateData)
    this.router.post("/login", authController.login);
    this.router.post("/signup", authController.signup);
    this.router.post("/confirmation", authController.validateConfirmation);
    this.router.post("/token/refresh", authController.tokenRefresh);
  }
}
