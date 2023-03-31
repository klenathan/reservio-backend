////// Dependencies
import { PrismaClient } from "@prisma/client";
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

////// Middlewares
import { JWTValidatorMiddleware } from "./Middlewares/JWTValidatorMiddleware";

////// Routes
import AuthRouter from "./Modules/Authentication/auth.routes";
import UserRouter from "./Modules/Users/user.routes";
import VendorRouter from "./Modules/Vendor/vendor.routes";

export default class ReservioServer {
  public instance: Application;
  public PORT: number;
  public options: any;
  private httpServer: http.Server;
  private db: PrismaClient;

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
    this.httpServer.listen(this.PORT, () => {
      console.info("Server started on: " + this.PORT);
    });
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
        version: "v0.1.0",
        documentation: "blank_for_now",
        message:
          "You are accessing Reservio's EC2 insctance API. From Reservio team with love 💗.",
      });
    });
    // JWTValidatorMiddleware
    this.instance.use("/auth", new AuthRouter(this.db).router);
    this.instance.use("/user", new UserRouter(this.db).router);
    this.instance.use("/vendor", new VendorRouter(this.db).router);
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
        error: CustomError | Error,
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        console.log("Error url: ", req.url);

        if (error instanceof CustomError) {
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
