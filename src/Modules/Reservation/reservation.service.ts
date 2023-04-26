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

  /////// WORKING ON THIS
  newReservation = async (data: DTONewReservation) => {
    let productQuery = await this.db.product
      .findFirstOrThrow({
        where: { id: data.product.productId },
        include: { ProductFixedTimeSlot: true },
      })
      .then((r) => {
        if (!r) {
          throw new NotFoundError(
            "PRODUCT_NOT_FOUND",
            `${data.product.productId} cannot be found`
          );
        }
        return r;
      });

    let _: Prisma.ReservationCreateInput;
    

    if (productQuery.type == "FIXED") {
      return await this.db.reservation.create({
        data: {
          customer: { connect: { username: data.user.username } },
          total: data.product.quantity * productQuery.price,
          quantity: data.product.quantity,
          Product: { connect: { id: data.product.productId } },
          ProductFixedTimeSlot: {
            connect: { id: data.product.productFixedTimeSlotId },
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
    return await this.db.reservation.create({
      data: {
        customer: { connect: { username: data.user.username } },
        total: 1000,
        quantity: data.product.quantity,
        Product: { connect: { id: data.product.productId } },
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
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
