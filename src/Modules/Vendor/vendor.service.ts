import { Prisma, PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";
import DTORequestVendor from "./types/DTORequestVendor";

export default class VendorService extends BaseService {
  private includeUserConfig = {
    select: {
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
    },
  };
  constructor(db: PrismaClient) {
    super(db);
  }

  getAllVendor = async () => {
    return await this.db.vendor.findMany({
      include: {
        user: this.includeUserConfig,
      },
    });
  };

  getVendorByUsername = async (username: string) => {
    return await this.db.vendor.findUniqueOrThrow({
      where: {
        username: username,
      },
      include: {
        user: this.includeUserConfig,
        products: true,
      },
    });
  };
  requestNewVendor = async (data: DTORequestVendor) => {
    let username = data.user.username;
    return await this.db.vendor.create({
      data: {
        username: data.user.username,
        desc: data.desc || "",
        user: { connect: { username: username } },
      },
    });
  };
}
