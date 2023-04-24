import { GetObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handleGetImage(fileName: string) {
  const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_,
    secretAccessKey: process.env.AWS_SECRETE_ACCESS_KEY_,
    region: "ap-southeast-1",
  } as S3ClientConfig;

  const client = new S3Client(config);
  const getCommand = await new GetObjectCommand({
    Bucket: "namthai-learn-s3", // reservio
    Key: fileName,
  });

  const url = await getSignedUrl(client as any, getCommand as any, {
    expiresIn: 3600,
  });
}
