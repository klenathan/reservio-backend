import { Prisma, PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";
import DTOAddToCart from "./types/DTOAddToCart";
import DTONewReservation from "./types/DTONewReservation";
import NotFoundError from "@/Errors/NotFoundError";
import CustomError from "@/Errors/CustomError";
import { log } from "console";

export default class ReservationService extends BaseService {
  private userQuerySelectConfig = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    email: true,
    phoneNo: true,
    avatar: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  };
  private reservationQueryOption = {
    customer: {
      select: this.userQuerySelectConfig,
    },
    Product: true,
    ProductFixedTimeSlot: true,
  };

  constructor(db: PrismaClient) {
    super(db);
  }
  getAllReservation = async () => {
    return await this.db.reservation.findMany({
      include: this.reservationQueryOption,
    });
  };

  getSingleReservation = async (id: string) => {
    return await this.db.reservation.findFirstOrThrow({
      where: { id: id },
      include: this.reservationQueryOption,
    });
  };

  /////// TODO: Implement discount
  newReservation = async (data: DTONewReservation) => {
    let productQuery = await this.db.product
      .findFirstOrThrow({
        where: { id: data.productId },
        include: { ProductFixedTimeSlot: true },
      })
      .then((r) => {
        if (!r) {
          throw new NotFoundError(
            "PRODUCT_NOT_FOUND",
            `${data.productId} cannot be found`
          );
        }
        return r;
      });

    let _: Prisma.ReservationCreateInput;

    if (productQuery.type == "FIXED") {
      return await this.db.reservation.create({
        data: {
          customer: { connect: { username: data.user.username } },
          total: data.quantity * productQuery.price,
          quantity: data.quantity,
          Product: { connect: { id: data.productId } },
          ProductFixedTimeSlot: {
            connect: { id: data.productFixedTimeSlotId },
          },
        },
        include: this.reservationQueryOption,
      });
    }

    //// If the Service is flexible time,
    //// 'ProductFixedTimeSlot' attribute is not needed
    if (!data.startAt || !data.endAt) {
      throw new CustomError(
        "INVALID_INPUT",
        "Flexible Service need to include 'startAt' and 'endAt'",
        400
      );
    }
    let startTime = new Date(data.startAt);
    let endTime = new Date(data.endAt);

    return await this.db.reservation.create({
      data: {
        customer: { connect: { username: data.user.username } },
        total:
          data.quantity *
          productQuery.price *
          (Math.abs(endTime.getTime() - startTime.getTime()) / 3600000),
        quantity: data.quantity,
        Product: { connect: { id: data.productId } },
        startAt: startTime,
        endAt: endTime,
      },
      include: this.reservationQueryOption,
    });
  };

  updateReservationStatus = async (
    reservationId: string,
    status: "PENDING" | "REJECTED" | "ACCEPTED"
  ) => {
    let reservation = await this.db.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: status,
      },
      include: this.reservationQueryOption,
    });
    return reservation;
  };

  removeAllReservation = async () => {
    return { message: "DO NOT ACCESS" };
  };
}
