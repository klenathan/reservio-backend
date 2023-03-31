import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import BaseController from "../Base/BaseController";
import DTORequestVendor from "./types/DTORequestVendor";
import VendorService from "./vendor.service";


export default class VendorController extends BaseController {
  declare service: VendorService;
  public constructor(db: PrismaClient) {
    super(db);
    this.service = new VendorService(this.db);
  }

  getAllVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let result = await this.service.getAllVendor();
      return res.status(200).send(result);
    } catch (e) {
      next(e);
    }
  };

  getVendorByUsername = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const username = req.params.id;
      let result = await this.service.getVendorByUsername(username);
      return res.status(200).send(result);
    } catch (e) {
      next(e);
    }
  };

  requestNewVendor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let data: DTORequestVendor = req.body;
      let result = await this.service.requestNewVendor(data);
      return res.status(200).send(result);
    } catch (e) {
      next(e);
    }
  };
}
