import { GetObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handleGetImage(fileName: string) {
  const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRETE_ACCESS_KEY,
    region: "ap-southeast-1",
  } as S3ClientConfig;

  const client = new S3Client(config);
  const getCommand = await new GetObjectCommand({
    Bucket: "reservio",
    Key: fileName,
  });

  const url = await getSignedUrl(client as any, getCommand as any, {
    expiresIn: 3600,
  });
}
