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
  }
}
