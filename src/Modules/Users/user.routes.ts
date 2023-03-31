import { PrismaClient } from "@prisma/client";

import BaseRouter from "../Base/BaseRouter";
import UserController from "./user.controller";

export default class UserRouter extends BaseRouter {
  public constructor(db: PrismaClient) {
    super(db);

    let userController = new UserController(db);

    this.router.get("/", userController.getAllUsers);
    this.router.get("/:id", userController.getSingleUserByUsername);
    this.router.patch("/:id");
    this.router.delete("/:id", userController.deleteSingleUserByUsername);
  }
}
