import UserDTO from "@/Modules/Authentication/Types/UserDTO";

export default interface DTONewReservation {
  user: UserDTO; // This is the userdata from middleware
  product: {
    productId: string;
    productFixedTimeSlotId: string;
    quantity: number;
  };
  startAt?: number;
  endAt?: number;
  discountId?: string;
}
