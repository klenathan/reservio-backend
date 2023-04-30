import CustomError from "@/Errors/CustomError";
import UnauthenticatedError from "@/Errors/UnauthenticatedError";
import { PrismaClient } from "@prisma/client";
import db from "../../PrismaClient";
import { time, timeEnd } from "console";
import { NextFunction, Request, Response } from "express";

export default async function trafficLogMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  time("Ledger");
  let ip = req.ip;
  if (ip == "::1") {
    timeEnd("Ledger");
    return next();
  }
  console.log(ip);
  console.log(req.originalUrl);
  await db.ledger.create({
    data: {
      path: req.originalUrl,
      ip: ip,
    },
  });
  timeEnd("Ledger");
  return next();
}
