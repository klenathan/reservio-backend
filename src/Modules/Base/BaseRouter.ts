import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import BaseController from "./BaseController";

export default class BaseRouter {
  declare router: Router;
  declare controller: BaseController;
  declare db: PrismaClient;

  public constructor(db: PrismaClient) {
    this.router = Router();
    this.db = db; 
  }
}
