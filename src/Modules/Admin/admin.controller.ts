import { PrismaClient } from "@prisma/client";
import BaseController from "../Base/BaseController";
import AdminService from "./admin.service";
import { NextFunction, Request, Response } from "express";

export default class AdminController extends BaseController {
  declare service: AdminService;
  public constructor(db: PrismaClient) {
    super(db);
    this.service = new AdminService(this.db);
  }

  getReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await this.service.getReport());
    } catch (e) {
      next(e);
    }
  };
  getVendorStat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(await this.service.getVendorStat());
    } catch (e) {
      next(e);
    }
  };
}
