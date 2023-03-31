import CustomError from "@/Errors/CustomError";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import BaseController from "../Base/BaseController";
import UserService from "./user.service";

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
