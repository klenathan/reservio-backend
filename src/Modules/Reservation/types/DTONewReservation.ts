import UserDTO from "@/Modules/Authentication/Types/UserDTO";

export default interface DTONewReservation {
  user: UserDTO; // This is the userdata from middleware

  productId: string;
  quantity: string;

  ///// For Fixed Products
  productFixedTimeSlotId?: string;

  ///// For Flexible Products
  startAt?: string;
  endAt?: string;
  discountId?: string;
}
