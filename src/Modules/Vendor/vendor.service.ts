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
      select: {
        id: true,
        username: true,
        name: true,
        userId: true,
        certified: true,
        status: true,
        phone: true,
        desc: true,
        category: false,
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

    console.time();
    const [avgRating, vendor, category] = await Promise.all([
      getAvgRating(),
      getVendor(),
      getVendorCategory(),
    ]);
    console.timeEnd();
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

  // "Vendor".username,
  // "Vendor".certified,
  // "Vendor".status,
  // "Vendor".desc,
  // "Vendor".created_at,
  // "Vendor".updated_at,
  // "Vendor".name,
  // "Vendor".phone

  getRevenuetFromUsernameByCategory = async (
    username: string,
    beginDate: Date
  ) => {
    return await this.db.$queryRaw`
        select 
        "Product".category,
        avg(total),
        sum(total),
        "Vendor".id
        from "Vendor" 
        inner join "Product" on "Vendor".id = "Product"."vendorId"
        inner join "Reservation" on "Reservation"."productId" = "Product".id
        where "Vendor".username = ${username}
        and "Reservation".updated_at > ${beginDate}
        group by "Product".category, "Vendor".id`.then((r: any) => {
      if (r.length > 0) {
        return r.map((each: any) => {
          each.avg = parseFloat(each.avg);
          each.sum = parseInt(each.sum);
          return each;
        });
      } else return [];
    });
  };

  getRevenuetFromUsernameByProduct = async (
    username: string,
    beginDate: Date
  ) => {
    return await this.db.$queryRaw`
        select 
        "Product".*,
        avg(total),
        sum(total)
        from "Vendor" 
        inner join "Product" on "Vendor".id = "Product"."vendorId"
        inner join "Reservation" on "Reservation"."productId" = "Product".id
        where "Vendor".username = ${username}
        and "Reservation".updated_at > ${beginDate}
        group by "Product".id`.then((r: any) => {
      if (r.length > 0) {
        return r.map((each: any) => {
          each.avg = parseFloat(each.avg);
          each.sum = parseInt(each.sum);
          return each;
        });
      } else return [];
    });
  };

  getVendorMetrics = async (username: string, beginDate: Date) => {
    console.time("get metrics");

    const metrics = await this.db.$queryRaw`
        select 
        "Vendor".id,
          avg(total),
          sum(total)
          from "Vendor" 
          inner join "Product" on "Vendor".id = "Product"."vendorId"
          inner join "Reservation" on "Reservation"."productId" = "Product".id
          where "Vendor".username = ${username}
          and "Reservation".updated_at > ${beginDate}
          group by "Vendor".id`.then((r: any) => {
      if (r.length > 0) {
        return r.map((each: any) => {
          each.avg = parseFloat(each.avg);
          each.sum = parseInt(each.sum);
          return each;
        })[0];
      } else return [];
    });
    console.timeEnd("get metrics");
    return metrics;
  };

  getVendor = async (username: string) => {
    console.time("get vendor");
    const vendor = await this.db.vendor.findUniqueOrThrow({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        name: true,
        userId: true,
        certified: true,
        status: true,
        phone: true,
        desc: true,
        category: false,
        user: this.includeUserConfig,
        _count: {
          select: { products: true },
        },
      },
    });
    console.timeEnd("get vendor");
    return vendor;
  };

  getRevenuetFromUsernameByDay = async (username: string, beginDate: Date) => {
    console.time("get metrics by day");
    const metrics = await this.db.$queryRaw`
        select 
        date_trunc('day', "Reservation".created_at) as "day",
        avg(total),
        sum(total)
        from "Vendor" 
        inner join "Product" on "Vendor".id = "Product"."vendorId"
        inner join "Reservation" on "Reservation"."productId" = "Product".id
        where "Vendor".username = ${username}
        and "Reservation".updated_at > ${beginDate}
        group by 1
      `.then((r: any) => {
      if (r.length > 0) {
        return r.map((each: any) => {
          each.avg = parseFloat(each.avg);
          each.sum = parseInt(each.sum);
          return each;
        });
      } else return [];
    });
    console.timeEnd("get metrics by day");
    return metrics;
  };

  getVendorReportByUsername = async (username: string) => {
    console.time("get report");
    const today = new Date().setUTCHours(0, 0, 0, 0) - 1000 * 3600 * 7;
    const beginDate: Date = new Date(today - 1000 * 3600 * 24 * 7);
    const [vendor, metrics, productRevenue, categoryRevenue, revenueByDay] =
      await Promise.all([
        this.getVendor(username),
        this.getVendorMetrics(username, beginDate),
        this.getRevenuetFromUsernameByProduct(username, beginDate),
        this.getRevenuetFromUsernameByCategory(username, beginDate),
        this.getRevenuetFromUsernameByDay(username, beginDate),
      ]);
    let result: any = {
      timeframe: {
        from: beginDate,
        to: new Date(),
      },
      vendor: vendor,
      metrics: metrics,
      productRevenue: productRevenue,
      revenueByDay: revenueByDay,
      categoryRevenue: categoryRevenue,
    };
    console.timeEnd("get report");
    return result;
  };
}
