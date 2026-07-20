import {
    CreateEmailIdentityCommand,
    PutEmailIdentityMailFromAttributesCommand,
    GetEmailIdentityCommand
} from "@aws-sdk/client-sesv2";
import { sesv2Client } from "../utils/sesClient";

const AWS_REGION = process.env.AWS_REGION || "us-east-1";

export const setupTenantDomain = async (tenantDomain: string, configurationSetName: string) => {
    const mailFromDomain = `bounces.${tenantDomain}`; // e.g., "bounces.startup.com"
    let dkimTokens: string[] = [];

    try {
        // 1. Verify Domain and Link to Configuration Set
        try {
            const identityCommand = new CreateEmailIdentityCommand({
                EmailIdentity: tenantDomain,
                ConfigurationSetName: configurationSetName,
            });
            const identityResponse = await sesv2Client.send(identityCommand);
            dkimTokens = identityResponse.DkimAttributes?.Tokens || [];
        } catch (error: any) {
            if (error.name === "AlreadyExistsException") {
                // If the domain already exists, we fetch its existing DKIM tokens
                const getIdentityCommand = new GetEmailIdentityCommand({
                    EmailIdentity: tenantDomain,
                });
                const existingIdentity = await sesv2Client.send(getIdentityCommand);
                dkimTokens = existingIdentity.DkimAttributes?.Tokens || [];
            } else {
                throw error;
            }
        }

        // 2. Set the Custom MAIL FROM Domain for strict DMARC alignment
        try {
            const mailFromCommand = new PutEmailIdentityMailFromAttributesCommand({
                EmailIdentity: tenantDomain,
                MailFromDomain: mailFromDomain,
                BehaviorOnMxFailure: "USE_DEFAULT_VALUE" // Fails back to amazonses.com if DNS is temporarily down
            });
            await sesv2Client.send(mailFromCommand);
        } catch (error: any) {
            console.error("Error setting MailFromDomain, continuing anyway:", error.message);
        }

        // 4. Construct the complete list of DNS records the user needs to add
        const dnsRecordsRequired = [
            // --- DKIM RECORDS (From AWS API) ---
            ...dkimTokens.map(token => ({
                type: "CNAME",
                name: `${token}._domainkey.${tenantDomain}`,
                value: `${token}.dkim.amazonses.com`
            })),

            // --- CUSTOM MAIL FROM RECORDS (Predictable based on region) ---
            {
                type: "MX",
                name: mailFromDomain,
                value: `10 feedback-smtp.${AWS_REGION}.amazonses.com`
            },
            {
                type: "TXT",
                name: mailFromDomain,
                value: `"v=spf1 include:amazonses.com ~all"`
            },

            // --- DMARC RECORD (Industry Standard) ---
            {
                type: "TXT",
                name: `_dmarc.${tenantDomain}`,
                value: `"v=DMARC1; p=none;"`
            }
        ];

        return {
            success: true,
            dnsRecords: dnsRecordsRequired
        };
    } catch (error: any) {
        console.error("Domain Setup Error:", error);
        throw new Error(error.message);
    }
};