import { PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";

export default class AuthService extends BaseService {
  public constructor(db: PrismaClient) {
    super(db);
  }

  handleLogin = async (username: string, password: string) => {
    
    return { status: "success" };
  };
}
