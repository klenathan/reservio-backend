import BaseService from "@/Modules/Base/BaseService";
import { Prisma, PrismaClient } from "@prisma/client";
import { query } from "express";

export default class SeachService extends BaseService {
  constructor(db: PrismaClient) {
    super(db);
  }
  search = async (query: string) => {
    let keyword = query.split(" ");

    // let userResult = await this.db.$queryRawUnsafe(
    //   `select * from "users"
    //     where "email" ILIKE $1`,
    //   `%${keyword}%`
    // );
    // let productResult = await this.db.$queryRawUnsafe(
    //   `select * from "Product"
    //     where "name" ILIKE $1`,
    //   `%${keyword[0]}%`
    // );

    const kw_joined = keyword.join(" | ");
    console.log(kw_joined);

    const userResult = await this.db.vendor.findMany({
      where: {
        username: {
          contains: query,
          mode: "insensitive",
        },
      },
    });
    const productResult = await this.db.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            desc: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });
    const result = {
      vendorResult: userResult,
      products: productResult,
    };
    return result;
  };
}
