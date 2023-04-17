import { JWTCheckMiddleware } from "@/Middlewares/JWTCheckMiddleware";
import { JWTValidatorMiddleware } from "@/Middlewares/JWTValidatorMiddleware";
import { PrismaClient } from "@prisma/client";

import BaseRouter from "../Base/BaseRouter";
import VendorController from "./vendor.controller";

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
    this.router.get(
      "/:id",
      JWTCheckMiddleware,
      vendorController.getVendorByUsername
    );
    this.router.patch("/:id");
    this.router.delete("/:id");
  }
}
