import { JWTCheckMiddleware } from "@/Middlewares/JWTCheckMiddleware";
import { JWTValidatorMiddleware } from "@/Middlewares/JWTValidatorMiddleware";
import { PrismaClient } from "@prisma/client";

import BaseRouter from "../Base/BaseRouter";
import VendorController from "./vendor.controller";
import { JWTValidatorMiddlewareNonUser } from "@/Middlewares/JWTValidatorMiddlewareNonUser";

export default class VendorRouter extends BaseRouter {
  public constructor(db: PrismaClient) {
    super(db);

    let vendorController = new VendorController(db);

    this.router.get("/", vendorController.getAllVendor);

    this.router.post(
      "/",
      JWTValidatorMiddleware,
      vendorController.requestNewVendor
    );
    this.router.get("/:id", vendorController.getVendorByUsername);
    this.router.get("/:id/report", vendorController.getVendorReportByUsername);
    this.router.put(
      "/",
      JWTValidatorMiddlewareNonUser,
      vendorController.update
    );
    this.router.delete("/:id");
  }
}
