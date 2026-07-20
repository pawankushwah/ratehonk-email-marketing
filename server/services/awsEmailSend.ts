import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { simpleParser } from "mailparser";
import { sesv2Client } from "../utils/sesClient";

export const sendCampaignEmail = async (tenantId: string, senderEmail: string, recipientEmail: string, subject: string, htmlBody: string) => {
    // Generate the 1-click unsubscribe webhook URL
    const unsubscribeUrl = `${process.env.APP_URL}/api/webhooks/unsubscribe?tenant=${tenantId}&email=${encodeURIComponent(recipientEmail)}`;

    const params = {
        FromEmailAddress: senderEmail,
        ReplyToAddresses: [`reply+${tenantId}@your-saas.com`], // Enables routing replies
        Destination: { ToAddresses: [recipientEmail] },
        Content: {
            Simple: {
                Subject: { Data: subject },
                Body: { Html: { Data: htmlBody } },
                Headers: [
                    { Name: "List-Unsubscribe", Value: `<${unsubscribeUrl}>` },
                    { Name: "List-Unsubscribe-Post", Value: "List-Unsubscribe=One-Click" }
                ]
            }
        },
        ConfigurationSetName: `${tenantId}-config`,
    };

    return await sesv2Client.send(new SendEmailCommand(params));
};

export const parseInboundEmailFromS3 = async (messageId) => {
    const command = new GetObjectCommand({
        Bucket: process.env.INBOUND_EMAIL_BUCKET,
        Key: messageId // SES saves the file using the Message ID as the filename
    });

    const s3Response = await s3Client.send(command);
    const parsedEmail = await simpleParser(s3Response.Body);

    return parsedEmail;
};