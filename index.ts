import "module-alias/register";
import ReservioServer from "./src/server";

console.log("Load .env:");
console.log(process.env.DATABASE_URL);
console.log(process.env.JWT_SECRETE);
console.log(process.env.JWT_REFRESH_TOKEN_SECRETE);
console.log(process.env.AWS_ACCESS_KEY);
console.log(process.env.AWS_SECRETE_ACCESS_KEY);



const server = new ReservioServer(8080);
server.start();
