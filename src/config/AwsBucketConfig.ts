import { S3Client } from "@aws-sdk/client-s3"
import { constants } from "../constants"

const s3Client = new S3Client({
  region: constants.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: constants.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: constants.AWS_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
})

export { s3Client }
