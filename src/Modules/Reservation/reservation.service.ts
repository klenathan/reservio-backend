import { PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";

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

  newReservation = async (data: any) => {
    let products = data.products.map((p: any) => {
      return {
        product: { connect: { id: p.productId } },
        quantity: parseInt(p.quantity),
        startAt: new Date(p.startAt),
      };
    });

    let result = await this.db.reservation.create({
      data: {
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
    return result;
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
}
