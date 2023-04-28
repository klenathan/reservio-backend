import UserDTO from "@/Modules/Authentication/Types/UserDTO";
import { Discount } from "@prisma/client";

export default interface NewDiscountDTO {
  user: UserDTO;
  id?: string;
  name: string;
  desc: string;
  amount: string;
  image: string;
  start: string;
  end: string;
}
