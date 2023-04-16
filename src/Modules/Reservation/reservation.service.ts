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
    let result = await this.db.reservation.create({
      data: {
        customer: { connect: { username: data.user.username } },
        total: 1000,
        ProuctReservation: {
          create: [
            {
              product: { connect: { id: data.productId } },
              quantity: parseInt(data.quantity),
            },
          ],
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

  acceptReservation = async (reservationId: string) => {
    let reservation = await this.db.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: "ACCEPTED",
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

  rejectReservation = async (reservationId: string) => {
    let reservation = await this.db.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: "REJECTED",
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
