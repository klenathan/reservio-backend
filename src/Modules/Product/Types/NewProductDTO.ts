import UserDTO from "@/Modules/Authentication/Types/UserDTO";
import { Prisma } from "@prisma/client";

export default interface NewProductDTO extends Prisma.ProductCreateInput {
  user: UserDTO;
  timeSlot?: string[];
  timeSlotConverted?: { from: number; to: number; quantity: number }[];
}
