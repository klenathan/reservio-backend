import { PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";

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
    username: string,
    reservationId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    feedback: string
  ) => {
    let result = await this.db.review.create({
      data: {
        product: { connect: { id: productId } },
        reservation: { connect: { id: reservationId } },
        user: { connect: { username: username } },
        rating: rating,
        feedback: feedback,
      },
    });

    return result;
  };
}
