import { ProductType, Category } from "@prisma/client";

export default interface IProductFilter {
  price?: {
    lte?: number;
    gte?: number;
  };
  type?: ProductType;
  category?: Category;
  ProductFixedTimeSlot?: {
    some: {
      from?: { gte: Date };
      to?: { lte: Date };
    };
  };
}
