import { Prisma, PrismaClient, Product } from "@prisma/client";

import BaseService from "../Base/BaseService";
import CustomError from "@/Errors/CustomError";
import UnauthorizedError from "@/Errors/UnauthorizedError";

import handleUploadMultipleProductImage from "@/Utils/HandleImages/handleUploadMultipleProductImage";

import IProductSort from "./Types/IProductSort";
import NewProductDTO from "./Types/NewProductDTO";
import IProductFilter from "./Types/IProductFilter";
import NewDiscountDTO from "./Types/NewDiscountDTO";
import handleUploadSingle from "@/Utils/HandleImages/handleUploadSingle";

export default class ProductService extends BaseService {
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

  // getAllProduct = async () => {
  //   return await this.db.product.findMany({
  //     orderBy: {
  //       reviews: {
  //         _count: "desc",
  //       },
  //     },
  //     include: {
  //       vendor: { include: { user: this.includeUserConfig } },
  //       ProductFixedTimeSlot: true,
  //       reviews: true,
  //       _count: {
  //         select: {
  //           reviews: true,
  //           Reservation: true,
  //         },
  //       },
  //     },
  //   });
  // };

  getHighlightProduct = async () => {
    return await this.db.product.findMany({
      take: 10,
      orderBy: {
        reviews: {
          _count: "desc",
        },
      },
      include: {
        vendor: { include: { user: this.includeUserConfig } },
        ProductFixedTimeSlot: true,
        reviews: true,
        _count: {
          select: {
            reviews: true,
            Reservation: true,
          },
        },
      },
    });
  };

  /**
   * Retrieve a single product by its id
   * @param id The id of the product to retrieve
   * @returns An object containing the retrieved product and its average rating
   * @throws {CustomError} If the product with the specified id does not exist
   */
  getSingleProduct = async (id: string) => {
    let product = await this.db.product.findFirstOrThrow({
      where: { id: id },
      include: {
        vendor: { include: { user: this.includeUserConfig } },
        ProductFixedTimeSlot: true,
        reviews: {
          include: { user: this.includeUserConfig },
        },
        _count: {
          select: {
            reviews: true,
            Reservation: true,
          },
        },
      },
    });
    let avg = 0;
    if (product._count.reviews != 0) {
      let sum = 0;
      product.reviews.forEach((review) => {
        sum += review.rating;
      });
      avg = sum / product._count.reviews;
    }

    return { avgRating: avg, ...product };
  };

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

  /**
  Retrieve products based on filter and sorting options.
  @param {Object} query - The query object containing filter and sorting options.
  @param {number} [take=20] - The number of products to retrieve.
  @returns {Promise<Array<Product>>} - The array of products that match the filter and sorting options.
  */
  productFiltering = async (
    query: any,
    take?: number
  ): Promise<Array<Product>> => {
    const filter = this.constructFilterOption(query);
    const sort = this.constructSortingOption(query);

    return await this.db.product.findMany({
      where: {
        ...filter,
      },
      orderBy: sort,
      take: take || 20,
      include: {
        vendor: { include: { user: this.includeUserConfig } },
        ProductFixedTimeSlot: true,
        reviews: true,
        _count: {
          select: {
            reviews: true,
            Reservation: true,
          },
        },
      },
    });
  };

  /**
  Retrieves vendors and products filtered by category.
  @async
  @param {Prisma.EnumCategoryFilter} category - The category to filter by.
  @returns {Promise<Product[]>} An object containing the vendors and products arrays.
  */
  getByCategory = async (
    category: Prisma.EnumCategoryFilter
  ): Promise<Product[]> => {
    const products = this.db.product.findMany({
      where: { category: category as Prisma.EnumCategoryFilter },
      include: {
        reviews: true,
        vendor: true,
        ProductFixedTimeSlot: true,
        _count: {
          select: {
            reviews: true,
            Reservation: true,
          },
        },
      },
    });
    return products;
  };

  /**
   * Creates a new product and uploads images for it
   * @param {NewProductDTO} data - The data for the new product
   * @param {Express.Multer.File[]} images - The images to upload for the product
   * @returns {Promise<Product>} A  newly created product
   */
  createProduct = async (
    data: NewProductDTO,
    images: Express.Multer.File[]
  ): Promise<Product> => {
    let result;

    // Validate required fields
    if (!(data.name && data.price)) {
      throw new CustomError(
        "MISSING_FIELD",
        `${data.name ?? "Product name,"} ${
          data.price ?? "Product price,"
        } is missing from the input request`,
        422
      );
    }

    // Check if the user is a vendor
    if (!data.user.vendor) {
      throw new UnauthorizedError(
        "NOT_A_VENDOR",
        `User ${data.user.username} is not a vendor`
      );
    }

    // Upload product images
    const imagesUploaded = await handleUploadMultipleProductImage(images);

    // Create the product based on its type
    if (data.type === "FLEXIBLE") {
      result = await this.db.product.create({
        data: {
          vendor: { connect: { id: data.user.vendor.id } },
          name: data.name,
          images: imagesUploaded,
          category: data.category,
          address: data.address || "RMIT University Vietnam",
          price: parseInt(data.price as unknown as string),
          desc: data.desc || "",
          type: data.type,
        },
        include: { vendor: true, ProductFixedTimeSlot: true },
      });
    } else if (data.type === "FIXED") {
      if (!data.timeSlot) {
        throw new CustomError(
          "INVALID_INPUT",
          "Missing 'ProductFixedTimeSlot' from request",
          422
        );
      }

      data.timeSlotConverted = data.timeSlot.map((slot) => {
        return JSON.parse(slot);
      });

      if (!data.timeSlotConverted) {
        throw new CustomError(
          "ERROR_CONVERT",
          "Server converting error in product.service",
          500
        );
      }
      result = await this.db.product.create({
        data: {
          vendor: { connect: { id: data.user.vendor.id } },
          ProductFixedTimeSlot: {
            createMany: {
              data: data.timeSlotConverted.map((slot) => {
                // console.log("From:", new Date(slot.from));
                return {
                  from: new Date(slot.from),
                  to: new Date(slot.to),
                  quantity: slot.quantity,
                };
              }),
            },
          },
          name: data.name,
          images: imagesUploaded,
          category: data.category,
          address: data.address || "RMIT University Vietnam",
          price: parseInt(data.price as unknown as string),
          desc: data.desc || "",
          type: data.type,
        },
        include: { vendor: true, ProductFixedTimeSlot: true },
      });
    } else {
      throw new CustomError(
        "INVALID_PRODUCT_TYPE",
        "Product type can only be 'FIXED' or 'FLEXIBLE'",
        422
      );
    }

    return result;
  };

  updateProduct = async (
    id: string,
    vendorID: string,
    data: Prisma.ProductUpdateInput
  ) => {
    await this.db.product
      .findFirstOrThrow({
        where: { id: id },
        include: { vendor: true, ProductFixedTimeSlot: true },
      })
      .then((r) => {
        if (r.vendorId != vendorID) {
          throw new UnauthorizedError(
            "UNAUTHORIZED",
            "You are not the owner of this service"
          );
        }
      });
    return await this.db.product.update({
      where: { id: id },
      data: data,
    });
  };

  getAllDiscount = async () => {
    return await this.db.discount.findMany();
  };

  createNewDiscount = async (
    data: NewDiscountDTO,
    image: Express.Multer.File
  ) => {
    // Upload product images
    const imagesUploaded = await handleUploadSingle(image);

    data.image = imagesUploaded;

    if (data.id) {
      let { user, amount, start, end, ...writeData } = data;
      return await this.db.discount.create({
        data: {
          ...writeData,
          amount: parseInt(amount),
          start: new Date(parseInt(start)),
          end: new Date(parseInt(end)),
        },
      });
    } else {
      let { id, user, amount, start, end, ...writeData } = data;
      return await this.db.discount.create({
        data: {
          ...writeData,
          amount: parseInt(amount),
          start: new Date(parseInt(start)),
          end: new Date(parseInt(end)),
        },
      });
    }
  };
}
