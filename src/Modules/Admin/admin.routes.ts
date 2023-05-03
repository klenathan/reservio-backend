import BaseRouter from "@/Modules/Base/BaseRouter";
import { PrismaClient } from "@prisma/client";
import AdminController from "./admin.controller";
import { JWTAdminValidator } from "@/Middlewares/JWTAdminValidator";

export default class AdminRouter extends BaseRouter {
  public constructor(db: PrismaClient) {
    super(db);

    let controller = new AdminController(db);
    this.router.get("/", JWTAdminValidator, controller.getReport);
    this.router.get("/vendor", JWTAdminValidator, controller.getVendorStat);
  }
}
