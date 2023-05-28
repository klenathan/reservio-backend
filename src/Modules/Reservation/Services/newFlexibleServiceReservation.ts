import {
  Prisma,
  PrismaClient,
  Product,
  ProductPayload,
  Reservation,
} from "@prisma/client";
import DTONewReservation from "../types/DTONewReservation";
import CustomError from "@/Errors/CustomError";
import NotEnoughSlot from "../Error/NotEnoughSlot";

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

export default async function newFlexibleServiceReservation(
  db: PrismaClient,
  data: DTONewReservation,
  productResult: Prisma.ProductGetPayload<{
    include: { Reservation: true };
  }>,
  discountRate: number
) {
  if (!data.startAt || !data.endAt) {
    throw new CustomError("MISSING_START_END_TIME", "Backend fault :)", 500);
  }
  const orderQuantity = parseInt(data.quantity);

  const placedSlot = productResult.Reservation.reduce((a: any, b: any) => {
    if (b.status != "PENDING") return a + b.quantity;
    else return a;
  }, 0);

  const slotLeft = productResult.quantity - placedSlot;

  if (orderQuantity > slotLeft) {
    throw new NotEnoughSlot(
      "QUANTITY_EXCEEDED",
      422,
      `Not enough quantity left. ${slotLeft} / ${
        productResult.quantity
      } is not enough for ${orderQuantity} from '${new Date(
        parseInt(data.startAt)
      ).toISOString()}' to '${new Date(parseInt(data.endAt)).toISOString()}'`,
      slotLeft
    );
  }

  if (!data.startAt || !data.endAt) {
    throw new CustomError(
      "INVALID_INPUT",
      "Flexible Service need to include 'startAt' and 'endAt'",
      400
    );
  }
  let startTime = new Date(parseInt(data.startAt));
  let endTime = new Date(parseInt(data.endAt));

  let totalBill = Math.ceil(
    parseInt(data.quantity) *
      productResult.price *
      ((100 - discountRate) / 100) *
      Math.ceil((endTime.getTime() - startTime.getTime()) / 3600000)
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
      quantity: parseInt(data.quantity),
      Product: { connect: { id: data.productId } },
      startAt: startTime,
      endAt: endTime,
    },
    include: reservationQueryOption,
  });
}
