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
    interface reviewGetResult {
      id: string;
      username: string;
      avg: number;
      count: number;
    }

    const getVendor = async () => {
      const res = this.db.vendor.findUniqueOrThrow({
        where: {
          username: username,
        },
        include: {
          user: this.includeUserConfig,
          products: {
            include: {
              reviews: true,
            },
          },
          _count: {
            select: { products: true },
          },
        },
      });
      return res;
    };

    const getVendorCategory = async () => {
      const categories = this.db.$queryRaw`
          select 
          distinct "Product".category
          from "Product" 
          inner join "Vendor" on "vendorId" = "Vendor".id
          where "Vendor".username = ${username}`.then((r: any) => {
        if (r.length > 0) return r.map((cate: any) => cate.category);
        else return [];
      });
      return categories;
    };

    const getAvgRating = async () => {
      const avgRating = this.db.$queryRaw`
        select 
        "Vendor"."id",
        "Vendor"."username",
        AVG("rating"), COUNT("rating") from "Review" 
        inner join "Product" on "productId" = "Product".id
        inner join "Vendor" on "vendorId" = "Vendor".id
        where "Vendor".username = ${username}
        group by "Vendor".id
        `.then((r: any) => {
        if (r.length == 0) {
          return {
            id: "asd",
            username: "asd",
            avg: 0,
            count: 0,
          };
        } else {
          r[0].count = parseInt(r[0].count) ?? 0;
          return r[0] as reviewGetResult;
        }
      });
      return avgRating;
    };
    
    console.time()
    const [avgRating, vendor, category] = await Promise.all([
      getAvgRating(),
      getVendor(),
      getVendorCategory(),
    ]);
    console.timeEnd()
    return {
      rating: { _avg: avgRating.avg, _count: avgRating.count },
      ...vendor,
      category: category,
    };
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
