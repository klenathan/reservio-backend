import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import BaseController from "../Base/BaseController";
import ReviewService from "./review.service";
import CustomError from "@/Errors/CustomError";

export default class ReviewController extends BaseController {
  declare service: ReviewService;
  public constructor(db: PrismaClient) {
    super(db);
    this.service = new ReviewService(this.db);
  }
  getServiceReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      return res
        .status(200)
        .send(await this.service.getServiceReview(req.params.id));
    } catch (e) {
      next(e);
    }
  };

  postReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.id;
      const username = req.body.user;
      const rating = req.body.rating;
      const feedback = req.body.feedback;
      const reservationId = req.params.reservationId;

      if (![1, 2, 3, 4, 5].includes(rating)) {
        throw new CustomError(
          "INVALID_RATING",
          "Make sure 'rating' is integer from 1 to 5",
          422
        );
      }
      return res.send(
        await this.service.postReview(
          productId,
          username,
          reservationId,
          rating,
          feedback
        )
      );
    } catch (e) {
      next(e);
    }
  };
}
