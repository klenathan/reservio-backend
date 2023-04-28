import BaseService from "@/Modules/Base/BaseService";
import { Prisma, PrismaClient } from "@prisma/client";

export default class SeachService extends BaseService {
  constructor(db: PrismaClient) {
    super(db);
  }
  search = async (query: string) => {
    const userQuery = async () => {
      return await this.db.vendor.findMany({
        include: {
          user: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        where: {
          OR: [
            {
              username: {
                search: query,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              desc: {
                search: query,
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
    };

    const productQuery = async () => {
      return await this.db.product.findMany({
        include: { vendor: true },
        where: {
          OR: [
            {
              name: {
                search: query,
                mode: "insensitive",
              },
            },
            {
              desc: {
                search: query,
                mode: "insensitive",
              },
            },
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
    };

    const [userResult, productResult] = await Promise.all([
      userQuery(),
      productQuery(),
    ]);

    const result = {
      vendors: userResult,
      products: productResult,
    };
    return result;
  };
}
