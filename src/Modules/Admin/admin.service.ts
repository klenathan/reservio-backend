import { PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";

export default class AdminService extends BaseService {
  constructor(db: PrismaClient) {
    super(db);
  }

  getTraffic = async () => {
    const traffic = await this.db.$queryRaw`
    select 
    date_trunc('day', "Ledger".timestamp) as "day", 
    Count(date_trunc('day', "Ledger".timestamp))
    from "Ledger"
    group by date_trunc('day', "Ledger".timestamp)
    order by Count(date_trunc('day', "Ledger".timestamp)) asc
    `.then((r: any) => {
      return r.map((row: any) => {
        row.count = parseInt(row.count);
        return row;
      });
    });
    return traffic;
  };

  getCategoryCount = async () => {
    return await this.db.$queryRaw`
    select "Product".category, count("Product".category) from "Product"
    inner join "Reservation" on "Reservation"."productId" = "Product".id
    group by "Product".category
    limit 10
    `.then((r: any) => {
      r.map((row: any) => {
        row.count = parseInt(row.count);
        return row;
      });
      return r;
    });
  };

  getVendorReservationCount = async () => {
    return await this.db.$queryRaw`
    select "Product"."vendorId", "Vendor".name, count("Product"."vendorId") from "Product"
    inner join "Vendor" on "Vendor".id = "Product"."vendorId"
    inner join "Reservation" on "Reservation"."productId" = "Product".id
    group by "Product"."vendorId",  "Vendor".name
    limit 10
    `.then((r: any) => {
      r.map((row: any) => {
        row.count = parseInt(row.count);
        return row;
      });
      return r;
    });
  };

  getTrafficStat = async () => {
    const trafficQuery = (await this.db.$queryRaw`
    select count(*) as "count" from "Ledger"
    where path like '/service%'
    `) as any;
    const trafficCount = parseInt(trafficQuery[0].count as string);

    const reservationCount = await this.db.reservation.count();

    const conversionRate = (reservationCount / trafficCount) * 100;
    return { trafficCount, reservationCount, conversionRate };
  };

  getReport = async () => {
    // const traffic = await this.getTraffic();

    const [trafficStat, categoryCount, VendorReservationCount] =
      await Promise.all([
        this.getTrafficStat(),
        this.getCategoryCount(),
        this.getVendorReservationCount(),
      ]);

    return {
      traffic: trafficStat,
      categoryCount: categoryCount,
      VendorReservationCount: VendorReservationCount,
      vendorStat: await this.getVendorStat(),
    };
  };

  getVendorStat = async () => {
    const result = await this.db.$queryRaw`select 
    "Vendor"."id",
    "Vendor"."username",
    "Vendor"."phone",
    "Vendor"."name",
    "Vendor"."userId",
    "Vendor"."certified",
    "Vendor"."status",
    "Vendor"."desc",
    "Vendor".created_at as createdAt,
    "Vendor".updated_at as updatedAt,
    "users"."firstName" as user_firstName,
    "users"."email" as user_email,
    "users"."phoneNo" as user_phoneNo,
    count("Reservation") as "sale" from "Vendor"
    inner join "users" on "Vendor"."userId" = "users".id
    left join "Product" on "Product"."vendorId" = "Vendor".id
    left join "Reservation" on "Reservation"."productId" = "Product".id
    group by "Vendor".id , "users".id
    `.then((r: any) => {
      r.map((row: any) => {
        row.sale = parseInt(row.sale);
        return row;
      });
      return r;
    });
    return result;
  };
}
