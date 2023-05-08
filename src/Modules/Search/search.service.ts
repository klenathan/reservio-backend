import BaseService from "@/Modules/Base/BaseService";
import { Prisma, PrismaClient } from "@prisma/client";
import IProductSort from "../Product/Types/IProductSort";
import IProductFilter from "../Product/Types/IProductFilter";


export default class SeachService extends BaseService {
  constructor(db: PrismaClient) {
    super(db);
  }
    /**
  Construct the filter options for retrieving products based on the query object.
  @param {Object} query - The query object containing filter options.
  @returns {Object} - The object containing the filter options for products.
  */
  constructFilterOption = (query: any) => {
    let filter: IProductFilter = {};

    if (query.minPrice) {
      if (!filter.price) {
        filter.price = {};
      }
      filter.price.gte = parseInt(query.minPrice);
    }

    if (query.maxPrice) {
      if (!filter.price) {
        filter.price = {};
      }
      filter.price.lte = parseInt(query.maxPrice);
    }

    if (query.fromDate) {
      const fromDate = parseInt(query.fromDate);
      if (!filter.ProductFixedTimeSlot) {
        filter.ProductFixedTimeSlot = {
          some: { from: { gte: new Date(fromDate) } },
        };
      } else {
        if (!filter.ProductFixedTimeSlot.some.from) {
          filter.ProductFixedTimeSlot = {
            some: { from: { gte: new Date(fromDate) } },
          };
        } else {
          filter.ProductFixedTimeSlot.some.from.gte = new Date(fromDate);
        }
      }
    }

    if (query.toDate) {
      const toDate = parseInt(query.toDate);
      if (!filter.ProductFixedTimeSlot) {
        filter.ProductFixedTimeSlot = {
          some: { to: { lte: new Date(toDate) } },
        };
      } else {
        if (!filter.ProductFixedTimeSlot.some.to) {
          filter.ProductFixedTimeSlot = {
            some: { to: { lte: new Date(toDate) } },
          };
        } else {
          filter.ProductFixedTimeSlot.some.to.lte = new Date(toDate);
        }
      }
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.type) {
      filter.type = query.type;
    }

    return filter;
  };

  /**
  Construct the sorting options for retrieving products based on the query object.
  @param {Object} query - The query object containing sorting options.
  @returns {Object} - The object containing the sorting options for products.
  */
  constructSortingOption = (query: any) => {
    let sort: IProductSort = {};

    if (query.sortCreatedAt) {
      sort.createdAt = query.sortCreatedAt as Prisma.SortOrder;
    }

    if (query.sortName) {
      sort.name = query.sortName as Prisma.SortOrder;
    }

    if (query.sortPrice) {
      sort.price = query.sortPrice as Prisma.SortOrder;
    }
    return sort;
  };
  
  search = async (query: string, others: any) => {
    // const filter = this.constructFilterOption(query);
    const sort = this.constructSortingOption(others);    
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
        orderBy: sort,
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
