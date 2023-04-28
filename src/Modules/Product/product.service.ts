import CustomError from "@/Errors/CustomError";
import handleUploadMultipleProductImage from "@/Utils/HandleImages/handleUploadMultipleProductImage";
import { Prisma, PrismaClient, Product } from "@prisma/client";
import BaseService from "../Base/BaseService";
import UnauthorizedError from "@/Errors/UnauthorizedError";
import ICategory from "./Types/ICategory";
import NewProductDTO from "./Types/NewProductDTO";

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

  getAllProduct = async () => {
    return await this.db.product.findMany({
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
  Retrieves vendors and products filtered by category.
  @async
  @param {Prisma.EnumCategoryFilter} category - The category to filter by.
  @returns {Promise<{vendors: Vendor[], products: Product[]}>} An object containing the vendors and products arrays.
  */
  getByCategory = async (category: Prisma.EnumCategoryFilter) => {
    const [vendors, products] = await Promise.all([
      this.db.vendor.findMany({
        where: { category: { has: category as any } },
        include: {
          user: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
      this.db.product.findMany({
        where: { category: category as Prisma.EnumCategoryFilter },
        include: {
          reviews: true,
          vendor: true,
          // ProductFixedTimeSlot: true,
          _count: {
            select: {
              reviews: true,
              Reservation: true,
            },
          },
        },
      }),
    ]);
    return {
      vendors: vendors,
      products: products,
    };
  };

  /**
   * Creates a new product and uploads images for it
   * @param {NewProductDTO} data - The data for the new product
   * @param {Express.Multer.File[]} images - The images to upload for the product
   * @returns {Product} A  newly created product
   */
  createProduct = async (
    data: NewProductDTO,
    images: Express.Multer.File[]
  ) => {
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

    // Upload product images
    const imagesUploaded = await handleUploadMultipleProductImage(images);

    // Check if the user is a vendor
    if (!data.user.vendor) {
      return 0;
    }

    // Create the product based on its type
    if (data.type === "FLEXIBLE") {
      result = await this.db.product.create({
        data: {
          vendor: { connect: { id: data.user.vendor.id } },
          name: data.name,
          images: imagesUploaded,
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

  getAllDiscount = async () => {
    return await this.db.discount.findMany();
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
}
