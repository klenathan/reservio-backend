import CustomError from "@/Errors/CustomError";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

/// controller
import BaseController from "../Base/BaseController";
import ProductService from "./product.service";

export default class ProductController extends BaseController {
  declare service: ProductService;
  constructor(db: PrismaClient) {
    super(db);
    this.service = new ProductService(db);
  }

  getAllProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.send(await this.service.getAllProduct());
    } catch (e) {
      next(e);
    }
  };

  getSingleProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      return res.send(await this.service.getSingleProduct(req.params.id));
    } catch (e) {
      next(e);
    }
  };

  newProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data = req.body;
      data.vendorUsername = req.body.user.username;

      if (!req.files) {
        throw new CustomError("MISSING_IMG", "Missing service images", 422);
      }

      return res
        .status(200)
        .send(
          await this.service.createProduct(
            req.body,
            req.files as Express.Multer.File[]
          )
        );
    } catch (e) {
      next(e);
    }
  };
}
