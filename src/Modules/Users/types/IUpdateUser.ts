import { Prisma } from "@prisma/client";

export default interface IUpdateUser extends Prisma.UserUpdateInput {
  user: Prisma.UserCreateInput;
}
