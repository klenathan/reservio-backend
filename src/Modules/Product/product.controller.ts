import CustomError from "@/Errors/CustomError";
import { Category, Prisma, PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

/// controller
import BaseController from "../Base/BaseController";
import ProductService from "./product.service";
import UnauthorizedError from "@/Errors/UnauthorizedError";
import ICategory from "./Types/ICategory";

const categories = [
  "Healthcare",
  "Transportation",
  "Legal",
  "Financial",
  "Education",
  "Maintenance_N_repair",
  "F_N_B",
  "Retail",
  "Hospitality",
  "Others",
];

export default class ProductController extends BaseController {
  declare service: ProductService;
  constructor(db: PrismaClient) {
    super(db);
    this.service = new ProductService(db);
  }

  getAllProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      //productSorting
      //productFiltering
      return res.send(await this.service.productFiltering(req.query));
    } catch (e) {
      next(e);
    }
  };

  getHighlightProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      return res.send(await this.service.getHighlightProduct());
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

  getByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = req.params.category;
      if (!categories.includes(category)) {
        throw new CustomError(
          "INVALID_CATEGORY",
          `Category '${category}' not found`,
          404
        );
      }
      return res.send(
        await this.service.getByCategory(category as Prisma.EnumCategoryFilter)
      );
    } catch (e) {
      next(e);
    }
  };

  newProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.user.vendor == null) {
        throw new UnauthorizedError("UNAUTHORIZED", "You are not yet a vendor");
      }

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

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.user.vendor == null) {
        throw new UnauthorizedError("UNAUTHORIZED", "You are not yet a vendor");
      }
      const id = req.params.id;
      const vendorID = req.body.user.vendor.id;
      const { user, ...newData } = req.body;

      return res.send(await this.service.updateProduct(id, vendorID, newData));
    } catch (e) {
      next(e);
    }
  };

  getAllDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.send(await this.service.getAllDiscount());
    } catch (e) {
      next(e);
    }
  };

  newDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body.user.admin) {
        
        throw new UnauthorizedError(
          "UNAUTHORIZED",
          `${req.body.user.username} is not admin, only admin can create new discount`
        );
      }

      if (!req.files) {
        throw new CustomError("MISSING_IMG", "Missing discount images", 422);
      }

      const image: Express.Multer.File[] = req.files as Express.Multer.File[];

      return res
        .status(200)
        .send(await this.service.createNewDiscount(req.body, image[0]));
    } catch (e) {
      next(e);
    }
  };
}
