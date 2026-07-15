import { Worker } from 'bullmq';
import { redisConnection } from './emailQueue';
import { smtpClient } from '../utils/smtpClient';

export const emailWorker = new Worker('email-queue', async job => {
  const { to, subject, htmlBody } = job.data;
  
  try {
    const fromAddress = process.env.SMTP_FROM_NAME 
      ? `"${process.env.SMTP_FROM_NAME}" <${process.env.EMAIL_FROM}>` 
      : process.env.EMAIL_FROM;

    const info = await smtpClient.sendMail({
      from: fromAddress as string,
      to,
      subject,
      html: htmlBody,
    });
    
    console.log(`Email sent successfully to ${to}, Message ID: ${info.messageId}`);
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
    throw err; // Let BullMQ handle retries
  }
}, { connection: redisConnection as any });

emailWorker.on('completed', job => {
  console.log(`Job with id ${job.id} has been completed`);
});
emailWorker.on('failed', (job, err) => {
  console.error(`Job with id ${job?.id} has failed with ${err.message}`);
});
