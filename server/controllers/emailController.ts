import { sendCampaignEmail as sendSESCampaignEmail } from "../services/awsEmailSend";

export const sendCampaignEmail = async ({ tenantId, fromEmail, toEmail, subject, htmlBody }: { tenantId: string, fromEmail: string, toEmail: string, subject: string, htmlBody: string }) => {
    try {
        const response = await sendSESCampaignEmail(tenantId, fromEmail, toEmail, subject, htmlBody);
        return { success: true, messageId: response.MessageId };
    } catch (error: any) {
        console.error("Email send error:", error);
        return { success: false, error: error.message };
    }
};