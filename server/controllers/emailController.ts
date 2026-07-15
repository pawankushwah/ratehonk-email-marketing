// controllers/emailController.js
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../utils/sesClient";
import type { Request, Response } from "express";

export const sendCampaignEmail = async ({ fromEmail, toEmail, subject, htmlBody }: { fromEmail: string, toEmail: string, subject: string, htmlBody: string }) => {
    // fromEmail must use the verified domain, e.g., hello@example.com

    const command = new SendEmailCommand({
        Destination: { ToAddresses: [toEmail] },
        Message: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: {
                Html: { Data: htmlBody, Charset: "UTF-8" },
            },
        },
        Source: fromEmail,
    });

    try {
        const response = await sesClient.send(command);
        return { success: true, messageId: response.MessageId };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};