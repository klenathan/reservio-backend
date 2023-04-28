import CustomError from "@/Errors/CustomError";
import { PutObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export default async function handleUploadSingle(
  img: Express.Multer.File
): Promise<string> {
  const config = {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_,
      secretAccessKey: process.env.AWS_SECRETE_ACCESS_KEY_,
    },
    region: "ap-southeast-1",
  } as S3ClientConfig;

  const client = new S3Client(config);
  let result: string;

  let imgName = `discount/${randomUUID()}-${img.originalname}`;
  let command = new PutObjectCommand({
    Bucket: "namthai-learn-s3", // reservio
    Key: imgName,
    Body: img.buffer,
  });

  try {
    await client.send(command);
    result = imgName;
  } catch (err: any) {
    console.log(err);
    throw new CustomError(err.name, err.message, 400);
  }

  return result;
}
