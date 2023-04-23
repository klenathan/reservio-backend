import CustomError from "@/Errors/CustomError";
import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import BaseController from "../Base/BaseController";
import UserService from "./user.service";
import IUpdateUser from "./types/IUpdateUser";

export default class UserController extends BaseController {
  declare service: UserService;
  constructor(db: PrismaClient) {
    super(db);
    this.service = new UserService(db);
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let result = await this.service.getAllUsers();

      return res.status(200).send(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  };

  getSingleUserByUsername = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const username = req.params.id;
      if (!username)
        throw new CustomError(
          "INVALID_REQUEST",
          "Cannot find username in request",
          422
        );
      let result = await this.service.getSingleUserByUsername(username);

      return res.status(200).send(result);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let userData: IUpdateUser = req.body;
      let { user, ...newData } = userData;

      if (!userData.user.id) {
        throw new CustomError("INVALID_INPUT", "Missing user ID", 422);
      }

      return res.send(
        await this.service.updateById(userData.user.id, newData)
      );
    } catch (e) {
      next(e);
    }
  };

  deleteSingleUserByUsername = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const username = req.params.id;
      if (!username)
        throw new CustomError(
          "INVALID_REQUEST",
          "Cannot find username in request",
          422
        );
      let result = await this.service.deleteByUsername(username);

      return res.status(200).send(result);
    } catch (e) {
      next(e);
    }
  };
}
