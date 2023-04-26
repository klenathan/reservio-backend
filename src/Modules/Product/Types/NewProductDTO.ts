import UserDTO from "@/Modules/Authentication/Types/UserDTO";
import { Prisma } from "@prisma/client";

export default interface NewProductDTO extends Prisma.ProductCreateInput {
  user: UserDTO;
}
