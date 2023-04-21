export default interface DTONewReservation {
  user: any; // This is the userdata from middleware
  products: {
    productId: string;
    quantity: number;
    startAt: number;
  }[];
}
