// controllers/domainController.ts
import { VerifyDomainDkimCommand, GetIdentityVerificationAttributesCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../utils/sesClient";
import dns from "dns/promises";
import crypto from "crypto";
import { db } from "../db";
import { domainVerifications } from "../db/schema";
import { emailQueue } from "../queue/emailQueue";
import { eq, and } from "drizzle-orm";

// Restricted generic email providers
const RESTRICTED_DOMAINS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com"
];

// Helper to get Domain Verification Template
const getDomainVerificationTemplate = (verificationLink: string, domain: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify your Domain</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px;">
    <div style="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h2 style="color: #333; margin-bottom: 20px;">Verify your domain: ${domain}</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Hi there,<br><br>
            Please click the button below to verify ownership of this email address and domain.
        </p>
        <a href="${verificationLink}" style="display: inline-block; padding: 14px 28px; background-color: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Domain</a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't request this, you can safely ignore this email.
        </p>
    </div>
</body>
</html>
`;

export const sendDomainVerificationEmail = async ({ email, userId }: { email: string; userId: string }) => {
    try {
        const lowerEmail = email.toLowerCase().trim();
        const parts = lowerEmail.split('@');
        if (parts.length !== 2) throw new Error("Invalid email address.");
        const domain = parts[1];

        if (RESTRICTED_DOMAINS.includes(domain)) {
            return {
                success: false,
                error: "Public domains like Gmail, Yahoo, and Hotmail cannot be used. Please use a custom business domain."
            };
        }

        const tokenString = crypto.randomBytes(32).toString('hex');
        
        // Hash the token for DB
        const hashedToken = crypto.createHash('sha256').update(tokenString).digest('hex');

        // Check if already verified
        const existing = await db.query.domainVerifications.findFirst({
            where: and(eq(domainVerifications.domain, domain), eq(domainVerifications.userId, userId))
        });

        if (existing?.status === 'verified') {
            return { success: false, error: "This domain is already verified for your account." };
        }

        if (existing) {
             await db.update(domainVerifications)
                 .set({ token: hashedToken, email: lowerEmail, status: 'pending' })
                 .where(eq(domainVerifications.id, existing.id));
        } else {
             await db.insert(domainVerifications).values({
                 userId,
                 email: lowerEmail,
                 domain,
                 token: hashedToken,
                 status: 'pending'
             });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const verificationLink = `${baseUrl}/verify-domain?token=${tokenString}`;

        await emailQueue.add('send-domain-verification-email', {
            to: lowerEmail,
            subject: 'Verify your Ratehonk Domain',
            htmlBody: getDomainVerificationTemplate(verificationLink, domain)
        });

        return { success: true, message: `Verification email sent to ${lowerEmail}. Please check your inbox.` };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const confirmDomainToken = async ({ token }: { token: string }) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const record = await db.query.domainVerifications.findFirst({
            where: eq(domainVerifications.token, hashedToken)
        });

        if (!record) {
            return { success: false, error: "Invalid or expired verification link." };
        }

        if (record.status === 'verified') {
            return { success: true, message: "Domain is already verified.", domain: record.domain };
        }

        await db.update(domainVerifications)
            .set({ status: 'verified' })
            .where(eq(domainVerifications.id, record.id));

        return { success: true, message: "Domain verified successfully!", domain: record.domain };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getUserDomains = async ({ userId }: { userId: string }) => {
    try {
        const domains = await db.query.domainVerifications.findMany({
            where: eq(domainVerifications.userId, userId),
            orderBy: (dv, { desc }) => [desc(dv.createdAt)]
        });
        return { success: true, domains };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const deleteDomain = async ({ id, userId }: { id: string; userId: string }) => {
    try {
        const record = await db.query.domainVerifications.findFirst({
            where: and(eq(domainVerifications.id, id), eq(domainVerifications.userId, userId))
        });

        if (!record) {
            return { success: false, error: "Domain not found or unauthorized." };
        }

        await db.delete(domainVerifications).where(eq(domainVerifications.id, id));

        return { success: true, message: "Domain deleted successfully." };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// Helper to identify DNS Provider
const identifyDnsProvider = async (domain: string) => {
    try {
        const nsRecords = await dns.resolveNs(domain);
        const nsString = nsRecords.join(',').toLowerCase();
        
        if (nsString.includes('cloudflare.com')) return 'Cloudflare';
        if (nsString.includes('domaincontrol.com')) return 'GoDaddy';
        if (nsString.includes('namecheaphosting.com') || nsString.includes('registrar-servers.com')) return 'Namecheap';
        if (nsString.includes('awsdns')) return 'AWS Route 53';
        if (nsString.includes('googledomains.com')) return 'Google Domains';
        if (nsString.includes('hostgator.com')) return 'HostGator';
        if (nsString.includes('bluehost.com')) return 'Bluehost';
        
        return 'Other';
    } catch (error) {
        return 'Unknown';
    }
};

// 1. Initiate Domain Verification
export const verifyDomain = async ({ domain, userId }: { domain: string, userId: string }) => {
    try {
        const lowerDomain = domain.toLowerCase().trim();
        
        if (RESTRICTED_DOMAINS.includes(lowerDomain)) {
            return {
                success: false, 
                error: "Public domains like Gmail, Yahoo, and Hotmail don't need to be verified or authenticated. Please use a custom domain."
            };
        }

        const provider = await identifyDnsProvider(lowerDomain);

        const command = new VerifyDomainDkimCommand({ Domain: lowerDomain });
        const response = await sesClient.send(command);

        // AWS returns 3 CNAME tokens that the user must add to their DNS
        const dkimTokens = response.DkimTokens?.map(token => ({
            type: "CNAME",
            name: `${token}._domainkey`,
            value: `${token}.dkim.amazonses.com`,
        }));

        // Insert into domain_verifications if not exists (so it shows in the list)
        const existingDomain = await db.query.domainVerifications.findFirst({
            where: and(eq(domainVerifications.domain, lowerDomain), eq(domainVerifications.userId, userId))
        });
        
        if (!existingDomain) {
            await db.insert(domainVerifications).values({
                userId,
                domain: lowerDomain,
                email: `admin@${lowerDomain}`, // placeholder email for direct auth
                token: 'direct-auth', // placeholder token for direct auth
                status: 'verified' // marked as verified since we bypassed email
            });
        }

        return {
            success: true,
            message: "DNS records generated.",
            records: dkimTokens,
            provider,
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// 2. Check Domain Verification Status
export const checkDomainStatus = async ({ domain }: { domain: string }) => {
    try {
        const command = new GetIdentityVerificationAttributesCommand({ Identities: [domain] });
        const response = await sesClient.send(command);

        const status = response.VerificationAttributes?.[domain]?.VerificationStatus || "NotFound";

        return { success: true, status };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};