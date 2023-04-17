import CustomError from "@/Errors/CustomError";
import handleUploadMultipleImage from "@/Utils/HandleImages/handleUploadMultipleImages";
import { Prisma, PrismaClient, Product } from "@prisma/client";
import BaseService from "../Base/BaseService";

export default class ProductService extends BaseService {
  constructor(db: PrismaClient) {
    super(db);
  }

  getAllProduct = async () => {
    return await this.db.product.findMany({
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
  };

  getSingleProduct = async (id: string) => {
    return await this.db.product.findFirstOrThrow({
      where: { id: id },
      include: { reviews: true },
    });
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
        vendor: { connect: { username: data.vendorUsername } },
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
}
