import NotFoundError from "@/Errors/NotFoundError";
import { Prisma, PrismaClient, User } from "@prisma/client";
import BaseService from "../Base/BaseService";

export default class UserService extends BaseService {
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

  getAllUsers = async () => {
    return await this.db.user.findMany({
      where: { status: "ACTIVATE" },
      select: this.userQuerySelectConfig,
    });
  };

  getSingleUserByUsername = async (username: string) => {
    return await this.db.user.findFirstOrThrow({
      where: { username: username, status: "ACTIVATE" },
      select: {
        ...this.userQuerySelectConfig,
        _count: { select: { reservations: true } },
        reservations: {
          include: {
            Product: {
              include: {
                vendor: {
                  include: { user: { select: this.userQuerySelectConfig } },
                },
                ProductFixedTimeSlot: true,
                reviews: true,
                _count: {
                  select: {
                    reviews: true,
                    Reservation: true,
                  },
                },
              },
            },
            ProductFixedTimeSlot: true,
          },
        },
        reviews: true,
      },
    });
  };

  updateById = async (id: string, data: Prisma.UserUpdateInput) => {
    return await this.db.user.update({
      where: { id: id },
      data: data,
    });
  };

  deleteByUsername = async (username: string) => {
    let user = await this.db.user
      .updateMany({
        where: { username: username, status: "ACTIVATE" },
        data: { status: "BANNED" },
      })
      .then((r) => {
        if (r.count == 0) {
          throw new NotFoundError(
            "USER_NOT_FOUND",
            `${username} cannot be found`
          );
        }

        return r;
      });
    return { status: "success", message: `User '${username}' is banned` };
  };
}
