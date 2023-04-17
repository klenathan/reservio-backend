import CustomError from "@/Errors/CustomError";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

import BaseController from "../Base/BaseController";
import ReservationService from "./reservation.service";

export default class ReservationController extends BaseController {
  declare service: ReservationService;
  public constructor(db: PrismaClient) {
    super(db);
    this.service = new ReservationService(this.db);
  }

  getAllReservation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let result = await this.service.getAllReservation();
      return res.status(200).send(result);
    } catch (e) {
      next(e);
    }
  };

  newReservation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(req.body.user && req.body.products)) {
        throw new CustomError(
          "INVALID_REQUEST",
          "Missing arguements from request",
          422
        );
      }
      return res.send(await this.service.newReservation(req.body));
    } catch (e) {
      next(e);
    }
  };

  acceptReservation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      return res.send(
        await this.service.updateReservationStatus(req.params.id, "ACCEPTED")
      );
    } catch (e) {
      next(e); 
    }
  };

  rejectReservation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      return res.send(
        await this.service.updateReservationStatus(req.params.id, "REJECTED")
      );
    } catch (e) {
      next(e);
    }
  };
}
