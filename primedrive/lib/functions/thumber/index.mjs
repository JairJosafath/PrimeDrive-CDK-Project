import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3Client = new S3Client(); // Replace with your region
const THUMBER_BUCKET = process.env.THUMBER_BUCKET;

export async function handler(event, context) {
  try {
    // Extract record details from event
    const bucket = event.bucket;
    const key = event.key;

    // Download image object from S3
    const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(getObjectCommand);
    const imageData = await  response.Body.transformToByteArray();

    // Resize image using Sharp
    const resizedImageBuffer = await sharp(imageData)
      .resize({ width: 128, height: 128 }) // Modify dimensions as needed
      .toBuffer();

    // Upload resized image back to S3 with new key
    const putObjectCommand = new PutObjectCommand({
      Bucket: THUMBER_BUCKET,
      Key: key,
      Body: resizedImageBuffer,
      ContentType: response.ContentType, // Maintain original content type
    });
    await s3Client.send(putObjectCommand);

    console.log('Successfully uploaded thumbnail:', key);
  } catch (error) {
    console.error('Error resizing or uploading thumbnail:', error);
  }
}
