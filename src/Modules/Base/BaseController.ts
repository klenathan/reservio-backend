import { PrismaClient } from "@prisma/client";


export default class BaseController {
  declare db: PrismaClient;

  public constructor(db: PrismaClient) {
    this.db = db;
  }
}
