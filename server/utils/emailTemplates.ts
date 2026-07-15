export const getRegistrationTemplate = (verificationLink: string, businessName: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Welcome to Ratehonk!</h2>
      <p>Hi ${businessName},</p>
      <p>Thanks for registering. Please click the link below to verify your email address and complete your registration:</p>
      <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
};

export const getContactAdminTemplate = (name: string, email: string, subject: string, message: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">New Contact Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
      <p><strong>Message:</strong></p>
      <div style="padding: 15px; background-color: #f9f9f9; border-left: 4px solid #007bff; margin-top: 10px;">
        ${message.replace(/\n/g, '<br>')}
      </div>
    </div>
  `;
};
