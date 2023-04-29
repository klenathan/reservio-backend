import CustomError from "@/Errors/CustomError";
import { Prisma, PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";
import DTORequestVendor from "./types/DTORequestVendor";
import NotFoundError from "@/Errors/NotFoundError";

export default class VendorService extends BaseService {
  private includeUserConfig = {
    select: {
      id: true,
      admin: true,
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
        _count: {
          select: { products: true },
        },
      },
    });
  };

  updateVendorData = async (id: string, data: Prisma.VendorUpdateInput) => {
    return await this.db.vendor.update({
      where: { id: id },
      data: data,
    });
  };

  requestNewVendor = async (data: DTORequestVendor) => {
    let username = data.user.username;

    let vendorCheck = await this.db.user.findFirst({
      where: { username: username },
      include: { vendor: true },
    });

    if (!vendorCheck) {
      throw new NotFoundError("USER_NOT_FOUND", `${username} cannot be found`);
    }

    if (vendorCheck.vendor) {
      throw new CustomError(
        "VENDOR_EXIST",
        `Vendor '@${username}' has already exist`,
        422
      );
    }

    let vendorPhone = data.phone ?? vendorCheck.phoneNo;

    return await this.db.vendor.create({
      data: {
        phone: vendorPhone,
        name: data.name,
        username: data.user.username,
        desc: data.desc || "",
        user: { connect: { username: username } },
      },
    });
  };
}
