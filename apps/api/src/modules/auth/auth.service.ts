import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { User, AccountStatus } from '@ai-lms/database';
import {
  RegisterInput,
  LoginInput,
  AuthResponse,
  AuthTokens,
  JwtPayload,
  JWT_CONSTANTS,
  OTP_CONSTANTS,
  PublicUser,
  UserRole,
} from '@ai-lms/shared';

import { authRepository } from './auth.repository';
import { env } from '@/config/env';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '@/shared/errors/app-errors';
import { emailService } from '@/infrastructure/email/email.service';
import { logger } from '@/shared/utils/logger';

export class AuthService {
  // ─── Token Generation ────────────────────────────────────────────────────

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      // Cast Prisma enum to shared enum — same string values, different module paths
      role: user.role as unknown as UserRole,
      schoolId: user.schoolId ?? null,
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRY,
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = { sub: user.id };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: JWT_CONSTANTS.REFRESH_TOKEN_EXPIRY,
    });
  }

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private sanitizeUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      // Cast Prisma enum to shared enum (same string values)
      role: user.role as unknown as UserRole,
      avatar: user.avatar ?? null,
    };
  }

  // ─── Register ────────────────────────────────────────────────────────────

  async register(input: RegisterInput, meta: { ip?: string; userAgent?: string }): Promise<AuthResponse> {
    // Check for duplicate email
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
    const user = await authRepository.createUser({ ...input, passwordHash });

    // Send email verification OTP
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_CONSTANTS.EXPIRY_MINUTES * 60 * 1000);
    await authRepository.createOtp({
      userId: user.id,
      code: otp,
      purpose: 'EMAIL_VERIFICATION',
      expiresAt: otpExpiresAt,
    });

    // Fire-and-forget email (don't block registration on email failure)
    emailService.sendVerificationEmail(user.email, user.firstName, otp).catch((err) => {
      logger.warn({ err }, 'Failed to send verification email');
    });

    const tokens = await this.createSession(user, meta);

    logger.info({ userId: user.id, email: user.email }, 'User registered');
    return { user: this.sanitizeUser(user), tokens };
  }

  // ─── Login ───────────────────────────────────────────────────────────────

  async login(input: LoginInput, meta: { ip?: string; userAgent?: string }): Promise<AuthResponse> {
    const user = await authRepository.findUserByEmail(input.email);

    // Timing-safe: run bcrypt even if user not found to prevent enumeration
    const dummyHash = '$2b$12$invalidhashforpreventionofenum';
    const passwordMatch = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? dummyHash,
    );

    if (!user || !passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === AccountStatus.PENDING_VERIFICATION) {
      throw new ForbiddenError(
        'Your student registration is pending approval by school administration. Please contact your administrator to activate your account.',
      );
    }

    if (user.status === AccountStatus.SUSPENDED) {
      throw new ForbiddenError('Your account has been suspended. Please contact support.');
    }

    if (user.status === AccountStatus.INACTIVE) {
      throw new ForbiddenError('Your account is inactive.');
    }

    await authRepository.updateUser(user.id, { lastLoginAt: new Date() });

    const tokens = await this.createSession(user, meta);

    logger.info({ userId: user.id, email: user.email }, 'User logged in');
    return { user: this.sanitizeUser(user), tokens };
  }

  // ─── Refresh Token ───────────────────────────────────────────────────────

  async refreshTokens(
    refreshToken: string,
    meta: { ip?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    let payload: { sub: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const session = await authRepository.findSession(refreshToken);
    if (!session) {
      // Token reuse detected — invalidate all sessions for this user
      await authRepository.deleteAllUserSessions(payload.sub);
      throw new UnauthorizedError('Token reuse detected. Please log in again.');
    }

    const user = await authRepository.findUserById(payload.sub);
    if (!user) throw new UnauthorizedError('User not found');

    // Rotate refresh token
    await authRepository.deleteSession(refreshToken);
    return this.createSession(user, meta);
  }

  // ─── Logout ──────────────────────────────────────────────────────────────

  async logout(refreshToken: string): Promise<void> {
    await authRepository.deleteSession(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await authRepository.deleteAllUserSessions(userId);
  }

  // ─── Email Verification ──────────────────────────────────────────────────

  async verifyEmail(userId: string, otp: string): Promise<void> {
    const otpRecord = await authRepository.findOtp(userId, 'EMAIL_VERIFICATION', otp);
    if (!otpRecord) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    if (otpRecord.attempts >= OTP_CONSTANTS.MAX_ATTEMPTS) {
      throw new BadRequestError('Too many failed attempts. Please request a new code.');
    }

    await authRepository.markOtpUsed(otpRecord.id);
    await authRepository.updateUser(userId, {
      isEmailVerified: true,
      status: AccountStatus.ACTIVE,
    });
  }

  async resendVerification(email: string): Promise<void> {
    const user = await authRepository.findUserByEmail(email);
    if (!user) return; // Silent — don't reveal if email exists

    if (user.isEmailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + OTP_CONSTANTS.EXPIRY_MINUTES * 60 * 1000);
    await authRepository.createOtp({
      userId: user.id,
      code: otp,
      purpose: 'EMAIL_VERIFICATION',
      expiresAt,
    });

    await emailService.sendVerificationEmail(user.email, user.firstName, otp);
  }

  // ─── Forgot / Reset Password ─────────────────────────────────────────────

  async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findUserByEmail(email);
    if (!user) return; // Silent — don't reveal if email exists

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + OTP_CONSTANTS.EXPIRY_MINUTES * 60 * 1000);
    await authRepository.createOtp({
      userId: user.id,
      code: otp,
      purpose: 'PASSWORD_RESET',
      expiresAt,
    });

    await emailService.sendPasswordResetEmail(user.email, user.firstName, otp);
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new NotFoundError('User not found');

    const otpRecord = await authRepository.findOtp(user.id, 'PASSWORD_RESET', otp);
    if (!otpRecord) {
      throw new BadRequestError('Invalid or expired reset code');
    }

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await authRepository.markOtpUsed(otpRecord.id);
    await authRepository.updateUser(user.id, { passwordHash });

    // Invalidate all sessions after password reset
    await authRepository.deleteAllUserSessions(user.id);
  }

  // ─── Get Current User ────────────────────────────────────────────────────

  async getMe(userId: string): Promise<PublicUser> {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new NotFoundError('User not found');
    return this.sanitizeUser(user);
  }

  // ─── Internal Helpers ─────────────────────────────────────────────────────

  private async createSession(
    user: User,
    meta: { ip?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await authRepository.createSession({
      userId: user.id,
      refreshToken,
      ...(meta.ip ? { ipAddress: meta.ip } : {}),
      ...(meta.userAgent ? { userAgent: meta.userAgent } : {}),
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
