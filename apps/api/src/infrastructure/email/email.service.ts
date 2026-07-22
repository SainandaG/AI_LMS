import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/shared/utils/logger';

class EmailService {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  private async send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (env.NODE_ENV === 'test') return; // Skip email in tests

    try {
      await this.transporter.sendMail({
        from: `"AI-LMS Platform" <${env.EMAIL_FROM}>`,
        ...options,
      });
      logger.info({ to: options.to, subject: options.subject }, 'Email sent');
    } catch (err) {
      logger.error({ err, to: options.to }, 'Failed to send email');
      throw err;
    }
  }

  async sendVerificationEmail(to: string, name: string, otp: string): Promise<void> {
    await this.send({
      to,
      subject: 'Verify your AI-LMS account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Welcome to AI-LMS, ${name}!</h2>
          <p>Please verify your email address using the code below:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="letter-spacing: 8px; color: #6366f1; font-size: 36px;">${otp}</h1>
          </div>
          <p style="color: #6b7280;">This code expires in 10 minutes.</p>
          <p style="color: #6b7280;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, otp: string): Promise<void> {
    await this.send({
      to,
      subject: 'Reset your AI-LMS password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Password Reset Request</h2>
          <p>Hi ${name}, use the code below to reset your password:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="letter-spacing: 8px; color: #ef4444; font-size: 36px;">${otp}</h1>
          </div>
          <p style="color: #6b7280;">This code expires in 10 minutes.</p>
          <p style="color: #6b7280;"><strong>If you didn't request this, please secure your account immediately.</strong></p>
        </div>
      `,
    });
  }

  async sendWelcomeEmail(to: string, name: string, role: string): Promise<void> {
    await this.send({
      to,
      subject: 'Welcome to AI-LMS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Welcome, ${name}!</h2>
          <p>Your account has been created with the role of <strong>${role}</strong>.</p>
          <p>You can now log in and start using the AI-LMS platform.</p>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
