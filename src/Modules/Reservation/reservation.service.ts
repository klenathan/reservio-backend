import {
  Prisma,
  PrismaClient,
  Discount,
  ProductFixedTimeSlot,
} from "@prisma/client";
import BaseService from "../Base/BaseService";
import DTOAddToCart from "./types/DTOAddToCart";
import DTONewReservation from "./types/DTONewReservation";
import NotFoundError from "@/Errors/NotFoundError";
import CustomError from "@/Errors/CustomError";

import newFixedServiceReservation from "./Services/newFixedServiceReservation";
import newFlexibleServiceReservation from "./Services/newFlexibleServiceReservation";

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

    Product: {
      include: {
        vendor: true,
      },
    },
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

  newReservation = async (data: DTONewReservation) => {
    // query
    let configForFlexibleService: any = () => {
      if (data.startAt && data.endAt) {
        return (configForFlexibleService = {
          where: {
            Reservation: {
              every: {
                startAt: new Date(parseInt(data.startAt)),
                endAt: new Date(parseInt(data.endAt)),
              },
            },
          },
          include: { Reservation: true },
        });
      }
    };

    let productQuery = async () =>
      this.db.product
        .findFirstOrThrow({
          where: {
            id: data.productId,
          },
          include: {
            Reservation: true,
            ProductFixedTimeSlot: {
              include: {
                ProuctReservation: true,
                _count: true,
              },
            },
            _count: {
              select: { Reservation: true },
            },
          },
          ...configForFlexibleService,
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

    const [productResult, discountRate] = await Promise.all([
      productQuery(),
      this.getDiscountRate(data.discountId),
    ]);

    if (productResult.type == "FIXED") {
      return await newFixedServiceReservation(
        this.db,
        data,
        productResult,
        discountRate
      );
    } else {
      ////// For flexible product

      return await newFlexibleServiceReservation(
        this.db,
        data,
        productResult as Prisma.ProductGetPayload<{
          include: { Reservation: true };
        }>,
        discountRate
      );
    }
  };

  getDiscountRate = async (discountId: string | undefined) => {
    if (!discountId) {
      return 0;
    }
    return await this.db.discount
      .findFirstOrThrow({
        where: { id: discountId },
      })
      .then((r) => {
        return r.amount;
      });
  };

  updateReservationStatus = async (
    reservationId: string,
    status: "PENDING" | "REJECTED" | "ACCEPTED" | "ONGOING" | "FINISHED"
  ) => {
    let acceptedConfig = {};
    if (status == "ACCEPTED") {
      acceptedConfig = {
        acceptedAt: new Date(),
      };
    }

    let reservation = await this.db.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: status,
        ...acceptedConfig,
      },
      include: this.reservationQueryOption,
    });
    return reservation;
  };

  removeAllReservation = async () => {
    return { message: "DO NOT ACCESS" };
  };
}
