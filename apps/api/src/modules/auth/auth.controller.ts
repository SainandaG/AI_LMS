import { Request, Response } from 'express';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  RefreshTokenSchema,
} from '@ai-lms/shared';
import { z } from 'zod';

import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const input = RegisterSchema.parse(req.body);
    const result = await authService.register(input, {
      ...(req.ip ? { ip: req.ip } : {}),
      ...(req.headers['user-agent'] ? { userAgent: req.headers['user-agent'] } : {}),
    });
    sendCreated(res, result, 'Registration successful. Please verify your email.');
  }

  async login(req: Request, res: Response): Promise<void> {
    const input = LoginSchema.parse(req.body);
    const result = await authService.login(input, {
      ...(req.ip ? { ip: req.ip } : {}),
      ...(req.headers['user-agent'] ? { userAgent: req.headers['user-agent'] } : {}),
    });
    sendSuccess(res, result, 'Login successful');
  }

  async refreshTokens(req: Request, res: Response): Promise<void> {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);
    const tokens = await authService.refreshTokens(refreshToken, {
      ...(req.ip ? { ip: req.ip } : {}),
      ...(req.headers['user-agent'] ? { userAgent: req.headers['user-agent'] } : {}),
    });
    sendSuccess(res, tokens, 'Tokens refreshed');
  }

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);
    await authService.logout(refreshToken);
    sendSuccess(res, null, 'Logged out successfully');
  }

  async logoutAll(req: Request, res: Response): Promise<void> {
    await authService.logoutAll(req.user!.sub);
    sendSuccess(res, null, 'Logged out from all devices');
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { otp } = z.object({ otp: z.string().length(6) }).parse(req.body);
    await authService.verifyEmail(req.user!.sub, otp);
    sendSuccess(res, null, 'Email verified successfully');
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await authService.resendVerification(email);
    sendSuccess(res, null, 'Verification email sent if account exists');
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = ForgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(email);
    sendSuccess(res, null, 'Password reset code sent if account exists');
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      email: z.string().email(),
      otp: z.string().length(6),
      password: z.string().min(8),
    });
    const { email, otp, password } = schema.parse(req.body);
    await authService.resetPassword(email, otp, password);
    sendSuccess(res, null, 'Password reset successfully. Please log in.');
  }

  async getMe(req: Request, res: Response): Promise<void> {
    const user = await authService.getMe(req.user!.sub);
    sendSuccess(res, user, 'User profile retrieved');
  }
}

export const authController = new AuthController();
