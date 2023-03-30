import UnauthenticatedError from "@/Errors/UnauthenticatedError";
import generateTokenPair from "@/Utils/generateTokenPair";
import { PrismaClient } from "@prisma/client";
import BaseService from "../Base/BaseService";
import { comparePassword } from "./Utils/passwordUtils";


import { PutObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import CustomError from "@/Errors/CustomError";

export default class AuthService extends BaseService {
  public constructor(db: PrismaClient) {
    super(db);
  }

  handleLogin = async (username: string, password: string) => {
    let user = await this.db.users.findFirstOrThrow({
      where: { username: username },
    });

    if (!(await comparePassword(password, user.password))) {
      throw new UnauthenticatedError(
        "WRONG_CREDENTIAL",
        `Wrong credential for user ${username}`
      );
    }

    let { password: _, ...returnData } = user;

    const [accessToken, refreshToken] = generateTokenPair(returnData);

    return {
      status: "success",
      user: returnData,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  };

  handleSignUp = async (avatar: Express.Multer.File) => {
    const config = {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRETE_ACCESS_KEY,
      region: "ap-southeast-1",
    } as S3ClientConfig;

    const client = new S3Client(config);

    // const imgBlob = fs.readFileSync(imagePath)
    console.log(avatar);
    

    const command = new PutObjectCommand({
      Bucket: "reservio",
      Key: avatar.originalname,
      Body: avatar.buffer,
    });

    try {
      const response = await client.send(command);
      console.log(response);
    } catch (err: any) {
      console.log(err);
      throw new CustomError(err.name, err.message, 400);
    }

    return { message: "done" };
  };
}
