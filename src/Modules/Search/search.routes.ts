import BaseRouter from "@/Modules/Base/BaseRouter";
import { PrismaClient } from "@prisma/client";
import SearchController from "./serach.controller";

export default class SearchRouter extends BaseRouter {
  public constructor(db: PrismaClient) {
    super(db);

    let controller = new SearchController(db);
    this.router.get("/", controller.mainSearch);
  }
}
