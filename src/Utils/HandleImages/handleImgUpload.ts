import CustomError from "@/Errors/CustomError";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";

export default async function handleImageUpload(
  img: Express.Multer.File,
  fileName: string
) {
  const config = {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRETE_ACCESS_KEY,
    },
    region: "ap-southeast-1",
  } as S3ClientConfig;

  const client = new S3Client(config);

  const command = new PutObjectCommand({
    Bucket: "namthai-learn-s3", // reservio
    Key: fileName,
    Body: img.buffer,
  });

  try {
    const response = await client.send(command);
    return fileName;
  } catch (err: any) {
    console.log(err);
    throw new CustomError(err.name, err.message, 400);
  }
}
