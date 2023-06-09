import { JWTValidatorMiddleware } from "@/Middlewares/JWTValidatorMiddleware";
import { PrismaClient } from "@prisma/client";
import BaseRouter from "../Base/BaseRouter";
import ReservationController from "./reservation.controller";

export default class ReservationRouter extends BaseRouter {
  public constructor(db: PrismaClient) {
    super(db);
    let controller = new ReservationController(db);
    this.router.get("/", controller.getAllReservation);
    this.router.post("/", JWTValidatorMiddleware, controller.newReservation);
    this.router.get(
      "/:id",
      JWTValidatorMiddleware,
      controller.getSingleReservation
    );
    this.router.put(
      "/accept/:id",
      JWTValidatorMiddleware,
      controller.acceptReservation
    );

    this.router.put(
      "/reject/:id",
      JWTValidatorMiddleware,
      controller.rejectReservation
    );
    this.router.delete("/", controller.deleteAllReservation);
  }
}
