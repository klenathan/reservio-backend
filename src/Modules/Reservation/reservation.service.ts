import { PrismaClient } from "@prisma/client";
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

  newReservation = async (data: DTONewReservation) => {
    let products = data.products.map((p: any) => {
      return {
        product: { connect: { id: p.productId } },
        quantity: parseInt(p.quantity),
        startAt: new Date(p.startAt),
      };
    });

    return await this.db.reservation.create({
      data: {
        vendor: { connect: { username: "pvdong" } },
        customer: { connect: { username: data.user.username } },
        total: 1000,
        ProuctReservation: {
          create: products,
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

  addToCart = async (data: DTOAddToCart) => {
    let result = this.db.cart.create({
      data: {
        user: { connect: { username: data.user.username } },
        product: { connect: { id: data.productID } },
        quantity: data.quantity,
      },
    });
    return result;
  };
}
