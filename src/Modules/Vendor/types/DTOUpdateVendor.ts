import { Prisma } from "@prisma/client";

export default interface DTOUpdateVendor extends Prisma.VendorCreateInput {
    requesrUserData: any
}