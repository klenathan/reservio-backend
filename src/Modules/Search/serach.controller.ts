import NotFoundError from "@/Errors/NotFoundError";
import BaseController from "@/Modules/Base/BaseController";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import SeachService from "./search.service";

export default class SearchController extends BaseController {
  declare service: SeachService;
  public constructor(db: PrismaClient) {
    super(db);
    this.service = new SeachService(this.db);
  }
  mainSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query.query) {
        throw new NotFoundError("INVALID_QUERY", "No query found on request");
      }
    //   console.log(req.query.query);
      
      return res.status(200).send(await this.service.search(req.query.query as string));
    } catch (e) {
      next(e);
    }
  };
}
