import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response, NextFunction } from "express";
import BaseController from "../Base/BaseController";
import DTORequestVendor from "./types/DTORequestVendor";
import VendorService from "./vendor.service";
import DTOUpdateVendor from "./types/DTOUpdateVendor";
import CustomError from "@/Errors/CustomError";

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

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestData: DTOUpdateVendor = req.body;

      if (!requestData.requesrUserData.vendor) {
        throw new CustomError("INVALID_INPUT", "You are not a vendor", 403);
      }
      if (!requestData.requesrUserData.vendor.id) {
        throw new CustomError("INVALID_INPUT", "Missing user ID from JWT", 422);
      }

      let { requesrUserData, ...newData } = req.body;
      return res.send(
        await this.service.updateVendorData(
          requestData.requesrUserData.vendor.id,
          newData
        )
      );
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
      if (!data.name) {
        data.name = data.user.firstName || "New Vendor";
      }
      return res.status(200).send(result);
    } catch (e) {
      next(e);
    }
  };
}
