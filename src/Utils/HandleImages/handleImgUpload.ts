import CustomError from "@/Errors/CustomError";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export default async function handleImageUpload(img: Express.Multer.File) {
  const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRETE_ACCESS_KEY,
    region: "ap-southeast-1",
  } as S3ClientConfig;

  const client = new S3Client(config);

  const fileName = `avatar/${randomUUID()}-${img.originalname}`;

  const command = new PutObjectCommand({
    Bucket: "reservio",
    Key: fileName,
    Body: img.buffer,
  });

  try {
    const response = await client.send(command);
    console.log(response);
    return response;
  } catch (err: any) {
    console.log(err);
    throw new CustomError(err.name, err.message, 400);
  }
}
