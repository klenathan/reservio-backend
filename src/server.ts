////// Dependencies
import { PrismaClient } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";
import cors from "cors";
import express, {
  Application,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";
import http, { createServer } from "http";
import multer from "multer";
import CustomError from "./Errors/CustomError";
import ErrorCode from "./Errors/ErrorCode";


////// Middlewares
import { JWTValidatorMiddleware } from "./Middlewares/JWTValidatorMiddleware";

////// Routes
import AuthRouter from "./Modules/Authentication/auth.routes";
import ProductRouter from "./Modules/Product/product.routes";
import UserRouter from "./Modules/Users/user.routes";
import VendorRouter from "./Modules/Vendor/vendor.routes";
import SearchRouter from "./Modules/Search/search.routes";
import ReservationRouter from "./Modules/Reservation/reservation.routes";
import ReviewRouter from "./Modules/Review/review.routes";

export default class ReservioServer {
  public instance: Application;
  public PORT: number;
  public options: any;
  // private httpServer: http.Server;
  private db: PrismaClient;
  httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

  public constructor(PORT: number) {
    this.instance = express();
    this.httpServer = createServer(this.instance);
    this.PORT = PORT;
    this.db = new PrismaClient({ errorFormat: "minimal" });

    this.middleware();
    this.routing();
    this.errorHandling();
  }

 

  public start() {
    // this.httpServer.listen(this.PORT, () => {
    //   console.info("Server started on: " + this.PORT);
    // });
    return this.instance;
  }

  private middleware() {
    let upload = multer();
    // CORS
    this.instance.use(cors());
    // JSON body parser
    this.instance.use(express.json());
    this.instance.use(express.urlencoded({ extended: true }));

    this.instance.use(upload.any());
  }

  private routing() {
    let defaultRoute = Router();
    defaultRoute.get("/", (req, res) => {
      return res.json({
        title: "RESERVIO's ExpressJS EC2 API",
        version: "v0.1.10",
        documentation: "blank_for_now",
        message:
          "You are accessing Reservio's EC2 insctance API. From Reservio team with love 💗.",
      });
    });
    // JWTValidatorMiddleware
    this.instance.use("/auth", new AuthRouter(this.db).router);
    this.instance.use("/user", new UserRouter(this.db).router);
    this.instance.use("/vendor", new VendorRouter(this.db).router);
    this.instance.use("/service", new ProductRouter(this.db).router);
    this.instance.use("/reservation", new ReservationRouter(this.db).router);
    this.instance.use("/search", new SearchRouter(this.db).router);
    this.instance.use("/review", new ReviewRouter(this.db).router);
    this.instance.get("/", defaultRoute);
    this.instance.use("*", (req, res) => {
      res.status(404).json({
        code: 404,
        title: "Reservio page not found",
        message: `Path ${req.url} cannot be found`,
      });
    });
  }

  private errorHandling() {
    this.instance.use(
      (
        error: CustomError | PrismaClientKnownRequestError | Error,
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        if (error instanceof PrismaClientKnownRequestError) {
          return res.status(500).json({
            error: ErrorCode[error.code] as string,
            message: error.message,
            code: error.code,
          });
        } else if (error instanceof CustomError) {
          return res.status(error.statusCode).json({
            error: error.name,
            message: error.message,
            code: error.statusCode,
          });
        }
        return res
          .status(400)
          .json({ error: error.name, message: error.message });
      }
    );
  }
}
