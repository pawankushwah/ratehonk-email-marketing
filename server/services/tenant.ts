import {
    CreateTenantCommand,
    CreateConfigurationSetCommand,
    PutConfigurationSetSuppressionOptionsCommand,
    CreateEmailIdentityCommand,
    PutEmailIdentityMailFromAttributesCommand,
    CreateTenantResourceAssociationCommand,
    DeleteTenantCommand,
    DeleteConfigurationSetCommand
} from "@aws-sdk/client-sesv2";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { sesv2Client } from "../utils/sesClient";

const stsClient = new STSClient({ region: process.env.AWS_REGION || "us-east-1" });

export const createTenantConfigSet = async (tenantId: string) => {
    const configSetName = `${tenantId}-config`;
    const region = process.env.AWS_REGION || "us-east-1";

    try {
        // 0. Get the AWS Account ID
        const identity = await stsClient.send(new GetCallerIdentityCommand({}));
        const accountId = identity.Account;

        // 1. Create the Tenant in AWS SES
        try {
            await sesv2Client.send(new CreateTenantCommand({
                TenantName: tenantId,
            }));
        } catch (tenantError: any) {
            if (tenantError.name !== "AlreadyExistsException") {
                console.error("Error creating Tenant:", tenantError);
                throw tenantError;
            }
        }

        // 2. Create the isolated Configuration Set
        await sesv2Client.send(new CreateConfigurationSetCommand({
            ConfigurationSetName: configSetName,
        }));

        // 3. Associate Configuration Set with the Tenant
        const configSetArn = `arn:aws:ses:${region}:${accountId}:configuration-set/${configSetName}`;
        try {
            await sesv2Client.send(new CreateTenantResourceAssociationCommand({
                TenantName: tenantId,
                ResourceArn: configSetArn
            }));
        } catch (assocError: any) {
            if (assocError.name !== "AlreadyExistsException") {
                console.error("Error associating Configuration Set to Tenant:", assocError);
                throw assocError;
            }
        }

        // 4. Enforce Tenant-Level Suppression (Bounces/Complaints)
        await sesv2Client.send(new PutConfigurationSetSuppressionOptionsCommand({
            ConfigurationSetName: configSetName,
            SuppressionScope: "TENANT",
            SuppressedReasons: ["BOUNCE", "COMPLAINT"]
        }));

        return { success: true, configSetName };
    } catch (error: any) {
        if (error.name === "AlreadyExistsException") {
            return { success: true, configSetName }; // Idempotent
        }
        console.error("Error creating Configuration Set:", error);
        throw error;
    }
};

export const onboardTenantDomain = async (tenantId: string, domainName: string) => {
    const configSetName = `${tenantId}-config`;
    const mailFromDomain = `bounces.${domainName}`;

    // 1. Create the isolated Configuration Set
    await createTenantConfigSet(tenantId);

    // 2. Verify the Domain and link it to the Configuration Set
    const identityResponse = await sesv2Client.send(new CreateEmailIdentityCommand({
        EmailIdentity: domainName,
        ConfigurationSetName: configSetName,
    }));

    // 3. Configure strict DMARC alignment via Custom MAIL FROM
    await sesv2Client.send(new PutEmailIdentityMailFromAttributesCommand({
        EmailIdentity: domainName,
        MailFromDomain: mailFromDomain,
        BehaviorOnMxFailure: "USE_DEFAULT_VALUE"
    }));

    // 4. Generate the exact DNS records the user must add to their GoDaddy/Cloudflare
    const dkimTokens = identityResponse.DkimAttributes?.Tokens || [];
    const region = process.env.AWS_REGION || "us-east-1";

    const dnsRecordsRequired = [
        ...dkimTokens.map(token => ({
            type: "CNAME",
            name: `${token}._domainkey.${domainName}`,
            value: `${token}.dkim.amazonses.com`
        })),
        { type: "MX", name: mailFromDomain, value: `10 feedback-smtp.${region}.amazonses.com` },
        { type: "TXT", name: mailFromDomain, value: `"v=spf1 include:amazonses.com ~all"` },
        { type: "TXT", name: `_dmarc.${domainName}`, value: `"v=DMARC1; p=none;"` }
    ];

    return { configSetName, dnsRecordsRequired };
};

export const deleteTenantResources = async (tenantId: string) => {
    const configSetName = `${tenantId}-config`;

    try {
        // 1. Delete the Configuration Set
        try {
            await sesv2Client.send(new DeleteConfigurationSetCommand({
                ConfigurationSetName: configSetName,
            }));
        } catch (error: any) {
            if (error.name !== "NotFoundException") {
                console.error("Error deleting Configuration Set:", error);
            }
        }

        // 2. Delete the Tenant
        try {
            await sesv2Client.send(new DeleteTenantCommand({
                TenantName: tenantId,
            }));
        } catch (error: any) {
            if (error.name !== "NotFoundException") {
                console.error("Error deleting Tenant:", error);
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error in deleteTenantResources:", error);
        throw error;
    }
};