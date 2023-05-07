import "module-alias/register";
import ReservioServer from "./src/server";
import ServerlessHttp from "serverless-http";
import db from "./PrismaClient";

// console.log("");
// console.log("#".repeat(20) + " Loading .env " + "#".repeat(20));
// console.log("#", process.env.JWT_SECRETE?.substring(0, 3) + "...");
// console.log(
//   "#",
//   process.env.JWT_REFRESH_TOKEN_SECRETE?.substring(0, 3) + "..."
// );
// console.log("#", process.env.AWS_ACCESS_KEY_?.substring(0, 3) + "...");
// console.log("#", process.env.AWS_SECRETE_ACCESS_KEY_?.substring(0, 3) + "...");
// console.log("#".repeat(40));

const server = new ReservioServer(8080, db);

if (process.env.STAGE == "dev") {
  server.start();
} else {
  try {
    module.exports.handler = ServerlessHttp(server.getInstance());
  } catch (error) {
    console.log(error);
  }
}
