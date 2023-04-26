import { PrismaClient } from "@prisma/client";

import BaseRouter from "../Base/BaseRouter";
import UserController from "./user.controller";
import { JWTValidatorMiddleware } from "@/Middlewares/JWTValidatorMiddleware";
import { request } from "express";

export default class UserRouter extends BaseRouter {
  public constructor(db: PrismaClient) {
    super(db);

    let userController = new UserController(db);

    this.router.get("/", userController.getAllUsers);
    
    this.router.put("/", JWTValidatorMiddleware, userController.update);
    this.router.delete("/:id", userController.deleteSingleUserByUsername);
    // this.router.get("/test", async (req, res) => {
    //   return res.send(
    //     await fetch(
    //       "https://06o7elozg8.execute-api.ap-southeast-1.amazonaws.com/dev/user/pvdong"
    //     ).then(async r => {
    //       return await r.json()
    //     })
    //   );
    // });
    this.router.get("/:id", userController.getSingleUserByUsername);
  }
}
