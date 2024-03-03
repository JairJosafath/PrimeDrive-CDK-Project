import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client();

export async function handler(event) {

  const key = event.key;
  const action = event.action;
  const sub = event.sub;

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `users/${sub}/${key}`
  };

  const command = action === "get" ? new GetObjectCommand(params) : action === "put"? new PutObjectCommand(params): undefined;

  if (!command) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid action" }),
    };
  }
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return {
    statusCode: 200,
    body: JSON.stringify({ url }),
  };
}
