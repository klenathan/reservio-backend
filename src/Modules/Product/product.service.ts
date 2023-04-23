import CustomError from "@/Errors/CustomError";
import handleUploadMultipleImage from "@/Utils/HandleImages/handleUploadMultipleImages";
import { Prisma, PrismaClient, Product } from "@prisma/client";
import BaseService from "../Base/BaseService";
import UnauthorizedError from "@/Errors/UnauthorizedError";

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
        reviews: true,
        _count: {
          select: {
            reviews: true,
            reservation: true,
          },
        },
      },
    });
  };

  getHighlightProduct = async () => {
    return await this.db.product.findMany({
      take: 10,
      orderBy: {
        reservation: {
          _count: "desc",
        },
        reviews: {
          _count: "desc",
        },
      },
      include: {
        vendor: { include: { user: this.includeUserConfig } },
        reviews: true,
        _count: {
          select: {
            reviews: true,
            reservation: true,
          },
        },
      },
    });
  };

  getSingleProduct = async (id: string) => {
    let product = await this.db.product.findFirstOrThrow({
      where: { id: id },
      include: {
        vendor: { include: { user: this.includeUserConfig } },
        reviews: {
          include: { user: this.includeUserConfig },
        },
        _count: {
          select: {
            reviews: true,
            reservation: true,
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

    let result = { avgRating: avg, ...product };
    return result;
  };

  calculateReviews = async () => {
    return;
  };

  getByCategory = async (category: Prisma.EnumCategoryFilter) => {
    let result = this.db.product.findMany({
      where: { category: category },
      include: {
        reviews: true,
        _count: {
          select: {
            reviews: true,
            reservation: true,
          },
        },
      },
    });
    return result;
  };

  createProduct = async (
    data: Prisma.ProductCreateManyInput,
    images: Express.Multer.File[]
  ) => {
    if (!(data.name && data.price)) {
      throw new CustomError(
        "MISSING_FIELD",
        `${data.name ?? "Product name,"} ${
          data.price ?? "Product price,"
        } is missing from the input request`,
        422
      );
    }

    let imagesUploaded = await handleUploadMultipleImage(images);

    let result = await this.db.product.create({
      data: {
        vendor: { connect: { id: data.vendorId } },
        name: data.name,
        images: imagesUploaded,
        address: data.address || "",
        price: parseInt(data.price as unknown as string),
        desc: data.desc || "",
      },
      include: { vendor: true },
    });

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
    let product = await this.db.product
      .findFirstOrThrow({
        where: { id: id },
        include: { vendor: true },
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
