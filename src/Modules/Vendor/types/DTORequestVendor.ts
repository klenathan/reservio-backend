import { Prisma } from "@prisma/client";

type DTORequestVendor = Prisma.VendorCreateInput & {
  user: any;
};

export default DTORequestVendor;
