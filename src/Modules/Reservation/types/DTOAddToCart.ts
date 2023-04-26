import UserDTO from "@/Modules/Authentication/Types/UserDTO";

export default interface DTOAddToCart {
  user: UserDTO; // User data from middleware
  productID: string;
  quantity: number;
}
