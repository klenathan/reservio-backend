import {
  PrismaClient,
  Product,
  ProductFixedTimeSlot,
  Reservation,
} from "@prisma/client";
import DTONewReservation from "../types/DTONewReservation";
import CustomError from "@/Errors/CustomError";

const userQuerySelectConfig = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNo: true,
  avatar: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const reservationQueryOption = {
  customer: {
    select: userQuerySelectConfig,
  },
  Product: true,
  ProductFixedTimeSlot: true,
};

export default async function newFixedServiceReservation(
  db: PrismaClient,
  data: DTONewReservation,
  productResult: any,
  discountRate: number
) {
  //   console.log(productResult);

  const quantityInt = parseInt(data.quantity);
  // console.log(productResult.Reservation);

  productResult.ProductFixedTimeSlot.forEach(
    (
      element: ProductFixedTimeSlot & {
        _count: any;
        ProuctReservation: Reservation[];
      }
    ) => {
      console.log(element);

      if (element.id == data.productFixedTimeSlotId) {
        const placedSlot = element.ProuctReservation.reduce(
          (a: any, b: any) => {
            if (b.status != "PENDING") return a + b.quantity;
          },
          0
        );
        const slotLeft = element.quantity - placedSlot;
        if (quantityInt > slotLeft) {
          throw new CustomError(
            "QUANTITY_EXCEEDED",
            `Not enough quantity left. ${slotLeft} / ${element.quantity} is not enough for ${quantityInt}`,
            422
          );
        }
      }
    }
  );
  let totalBill = Math.ceil(
    quantityInt * productResult.price * ((100 - discountRate) / 100)
  );
  if (totalBill > 2147483647) {
    throw new CustomError(
      "ORDER_TOO_LARGE",
      "The order is too large to handle. Please contact customer service",
      500
    );
  }
  return await db.reservation.create({
    data: {
      customer: { connect: { username: data.user.username } },
      total: totalBill,
      quantity: quantityInt,
      Product: { connect: { id: data.productId } },
      ProductFixedTimeSlot: {
        connect: { id: data.productFixedTimeSlotId },
      },
    },
    include: reservationQueryOption,
  });
}
