import { Prisma, PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";
import DTOAddToCart from "./types/DTOAddToCart";
import DTONewReservation from "./types/DTONewReservation";

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

  constructor(db: PrismaClient) {
    super(db);
  }
  getAllReservation = async () => {
    return await this.db.reservation.findMany();
  };
  /////// WORKING ON THIS
  newReservation = async (data: DTONewReservation) => {
    let product = await this.db.product.findFirstOrThrow({
      where: { id: data.product.productId },
    });

    let _: Prisma.ReservationCreateInput;

    if (product.type == "FIXED") {
      await this.db.reservation.create({
        data: {
          customer: { connect: { username: data.user.username } },
          total: 1000,
          ProuctReservation: {
            createMany: {
              data: [
                {
                  quantity: data.product.quantity,
                  productId: product.id,
                  productFixedTimeSlotId: data.product.productFixedTimeSlotId,
                },
              ],
            },
          },
        },
        include: {
          customer: {
            select: this.userQuerySelectConfig,
          },
          ProuctReservation: {
            include: { product: true },
          },
        },
      });
    } else {
    }

    return await this.db.reservation.create({
      data: {
        customer: { connect: { username: data.user.username } },
        total: 1000,
        ProuctReservation: {
          create: { quantity: data.product.quantity, productId: product.id },
        },
      },
      include: {
        customer: {
          select: this.userQuerySelectConfig,
        },
        ProuctReservation: {
          include: { product: true },
        },
      },
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
      include: {
        customer: {
          select: this.userQuerySelectConfig,
        },
        ProuctReservation: {
          include: { product: true },
        },
      },
    });
    return reservation;
  };

  removeAllReservation = async () => {
    return { message: "DO NOT ACCESS" };
  };
}
