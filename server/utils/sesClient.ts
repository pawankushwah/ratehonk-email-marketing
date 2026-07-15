import { SESClient } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
dotenv.config();

// Initialize the Amazon SES client
// console.log(`Hello Pawan, ${process.env.AWS_ACCESS_KEY_ID}, ${process.env.AWS_SECRET_ACCESS_KEY}, ${process.env.AWS_REGION}`)
export const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
