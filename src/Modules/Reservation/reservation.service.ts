import { Prisma, PrismaClient, Discount } from "@prisma/client";
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
    /// querey
    let productQuery = async () =>
      this.db.product
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

    let discountQuery = async () => {
      if (!data.discountId) {
        return 0;
      }
      return await this.db.discount
        .findFirstOrThrow({
          where: { id: data.discountId },
        })
        .then((r) => {
          return r.amount;
        });
    };

    const [productResult, discountRate] = await Promise.all([
      productQuery(),
      discountQuery(),
    ]);

    if (productResult.type == "FIXED") {
      let totalBill = Math.ceil(
        parseInt(data.quantity) *
          productResult.price *
          ((100 - discountRate) / 100)
      );
      if (totalBill > 2147483647) {
        throw new CustomError(
          "ORDER_TOO_LARGE",
          "The order is too large to handle. Please contact customer service",
          500
        );
      }
      return await this.db.reservation.create({
        data: {
          customer: { connect: { username: data.user.username } },
          total: totalBill,
          quantity: parseInt(data.quantity),
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
    let startTime = new Date(parseInt(data.startAt));
    let endTime = new Date(parseInt(data.endAt));
    let totalBill = Math.ceil(
      parseInt(data.quantity) *
        productResult.price *
        ((100 - discountRate) / 100) *
        Math.ceil((endTime.getTime() - startTime.getTime()) / 3600000)
    );
    if (totalBill > 2147483647) {
      throw new CustomError(
        "ORDER_TOO_LARGE",
        "The order is too large to handle. Please contact customer service",
        500
      );
    }
    return await this.db.reservation.create({
      data: {
        customer: { connect: { username: data.user.username } },
        total: totalBill,
        quantity: parseInt(data.quantity),
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
