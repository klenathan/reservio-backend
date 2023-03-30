import "module-alias/register";
import ReservioServer from "./src/server";

const server = new ReservioServer(8080);
server.start();
