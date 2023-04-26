import { Prisma, User } from "@prisma/client";

type DTORequestVendor = Prisma.VendorCreateInput & {
  user: User;
};

export default DTORequestVendor;
