import { PrismaClient } from "@prisma/client";

import BaseRouter from "../Base/BaseRouter";
import UserController from "./user.controller";
import { JWTValidatorMiddleware } from "@/Middlewares/JWTValidatorMiddleware";

export default class UserRouter extends BaseRouter {
  public constructor(db: PrismaClient) {
    super(db);

    let userController = new UserController(db);

    this.router.get("/", JWTValidatorMiddleware, userController.getAllUsers);
    this.router.get("/:id", userController.getSingleUserByUsername);
    this.router.put("/", JWTValidatorMiddleware, userController.update);
    this.router.delete("/:id", userController.deleteSingleUserByUsername);
  }
}
