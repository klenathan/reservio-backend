import { PrismaClient } from "@prisma/client";

export default class BaseService {
  declare db: PrismaClient;
  public constructor(db: PrismaClient) {
    this.db = db;
  }
}
