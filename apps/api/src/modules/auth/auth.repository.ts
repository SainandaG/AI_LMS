import { prisma, User, UserRole } from '@ai-lms/database';
import { RegisterInput } from '@ai-lms/shared';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { googleId, deletedAt: null },
    });
  }

  async createUser(
    data: RegisterInput & { passwordHash: string; role?: UserRole; schoolId?: string },
  ): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.phone ? { phone: data.phone } : {}),
        role: data.role ?? UserRole.STUDENT,
        ...(data.schoolId ? { schoolId: data.schoolId } : {}),
      },
    });
  }

  async createGoogleUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    googleId: string;
    role?: UserRole;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.avatar ? { avatar: data.avatar } : {}),
        googleId: data.googleId,
        role: data.role ?? UserRole.STUDENT,
        isEmailVerified: true,
        status: 'ACTIVE',
      },
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async createSession(data: {
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }) {
    return prisma.userSession.create({
      data: {
        userId: data.userId,
        refreshToken: data.refreshToken,
        ...(data.userAgent ? { userAgent: data.userAgent } : {}),
        ...(data.ipAddress ? { ipAddress: data.ipAddress } : {}),
        expiresAt: data.expiresAt,
      },
    });
  }

  async findSession(refreshToken: string) {
    return prisma.userSession.findUnique({ where: { refreshToken } });
  }

  async deleteSession(refreshToken: string): Promise<void> {
    await prisma.userSession.deleteMany({ where: { refreshToken } });
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    await prisma.userSession.deleteMany({ where: { userId } });
  }

  async createOtp(data: {
    userId: string;
    code: string;
    purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'TWO_FACTOR_AUTH';
    expiresAt: Date;
  }) {
    // Invalidate old OTPs for same user+purpose
    await prisma.otpCode.updateMany({
      where: { userId: data.userId, purpose: data.purpose, isUsed: false },
      data: { isUsed: true },
    });
    return prisma.otpCode.create({ data });
  }

  async findOtp(userId: string, purpose: string, code: string) {
    return prisma.otpCode.findFirst({
      where: {
        userId,
        purpose: purpose as 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'TWO_FACTOR_AUTH',
        code,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async markOtpUsed(id: string): Promise<void> {
    await prisma.otpCode.update({ where: { id }, data: { isUsed: true } });
  }

  async incrementOtpAttempts(id: string): Promise<void> {
    await prisma.otpCode.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }
}

export const authRepository = new AuthRepository();
