import { Prisma } from "@prisma/client";

export default interface IProductSort {
  createdAt?: Prisma.SortOrder;
  name?: Prisma.SortOrder;
  price?: Prisma.SortOrder;
}
