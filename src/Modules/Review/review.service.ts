import { PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";
import UserDTO from "../Authentication/Types/UserDTO";

export default class ReviewService extends BaseService {
  private userQuerySelectConfig = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    email: true,
    phoneNo: true,
    avatar: true,
    vendor: true,
    status: true,
    admin: true,
    createdAt: true,
    updatedAt: true,
  };

  constructor(db: PrismaClient) {
    super(db);
  }

  getServiceReview = async (id: string) => {
    let result = await this.db.review.findMany({
      where: { productId: id },
      include: {
        user: { select: this.userQuerySelectConfig },
        product: true,
      },
    });
    return result;
  };

  postReview = async (
    productId: string,
    user: UserDTO,
    reservationId: string,
    rating: number,
    feedback: string
  ) => {
    let result = await this.db.review.create({
      data: {
        product: { connect: { id: productId } },
        reservation: { connect: { id: reservationId } },
        user: { connect: { username: user.id } },
        rating: rating,
        feedback: feedback,
      },
    });

    let resv = await this.db.reservation.update({
      data: {
        status: "RATED",
      },
      where: { id: reservationId },
    });

    return result;
  };
}
