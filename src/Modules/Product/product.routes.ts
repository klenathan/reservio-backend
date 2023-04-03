import { JWTValidatorMiddleware } from "@/Middlewares/JWTValidatorMiddleware";
import { PrismaClient } from "@prisma/client";

import BaseRouter from "../Base/BaseRouter";
import ProductController from "./product.controller";

export default class ProductRouter extends BaseRouter {
  public constructor(db: PrismaClient) {
    super(db);

    let productController = new ProductController(db);

    this.router.get("/");
    this.router.post("/", JWTValidatorMiddleware, productController.newProduct);
    this.router.get("/:id");
    this.router.patch("/:id");
    this.router.delete("/:id");
  }
}