import { PrismaClient } from "@prisma/client";
import BaseRouter from "../Base/BaseRouter";
import ReviewController from "./review.controller";
import { JWTValidatorMiddleware } from "@/Middlewares/JWTValidatorMiddleware";

export default class ReviewRouter extends BaseRouter {
  public constructor(db: PrismaClient) {
    super(db);

    let controller = new ReviewController(db);
    this.router.get("/service/:id", controller.getServiceReview);
    this.router.post(
      "/service/:id",
      JWTValidatorMiddleware,
      controller.postReview
    );
  }
}
