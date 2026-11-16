import { S3Client } from "@aws-sdk/client-s3";
import "dotenv/config";

const s3Config = {
  region: process.env.AWS_REGION || "ap-south-1",
};

// Use explicit credentials if provided, otherwise let AWS SDK resolve IAM Role
if (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  };
}

const s3 = new S3Client(s3Config);

export default s3;

