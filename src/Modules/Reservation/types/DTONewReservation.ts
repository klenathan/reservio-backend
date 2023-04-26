import UserDTO from "@/Modules/Authentication/Types/UserDTO";

export default interface DTONewReservation {
  user: UserDTO; // This is the userdata from middleware
  productId: string;
  quantity: number;
  ///// For Fixed Products
  productFixedTimeSlotId?: string;
  ///// For Flexible Products
  startAt?: number;
  endAt?: number;
  discountId?: string;
}
