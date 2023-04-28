import { JWTCheckMiddleware } from "@/Middlewares/JWTCheckMiddleware";
import { JWTValidatorMiddleware } from "@/Middlewares/JWTValidatorMiddleware";
import { PrismaClient } from "@prisma/client";

import BaseRouter from "../Base/BaseRouter";
import ProductController from "./product.controller";

export default class ProductRouter extends BaseRouter {
  public constructor(db: PrismaClient) {
    super(db);

    let productController = new ProductController(db);

    this.router.get("/", productController.getAllProduct);
    this.router.get("/highlight", productController.getHighlightProduct);
    this.router.get("/discount", productController.getAllDiscount);
    this.router.post("/", JWTValidatorMiddleware, productController.newProduct);
    this.router.post(
      "/discount",
      JWTValidatorMiddleware,
      productController.newDiscount
    );

    this.router.get("/category/:category", productController.getByCategory);
    this.router.get(
      "/:id",
      JWTCheckMiddleware,
      productController.getSingleProduct
    );
    this.router.put("/:id", JWTValidatorMiddleware, productController.update);
    this.router.delete("/:id");
  }
}
