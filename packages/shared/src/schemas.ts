import { z } from 'zod';

// ─── Common ────────────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const IdParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// ─── Auth Schemas ──────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character',
    ),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50).trim(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50).trim(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number')
    .optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain uppercase, lowercase, number, and special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain uppercase, lowercase, number, and special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ─── School Schemas ────────────────────────────────────────────────────────────

export const CreateSchoolSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  code: z
    .string()
    .min(2)
    .max(20)
    .toUpperCase()
    .regex(/^[A-Z0-9_-]+$/, 'School code can only contain letters, numbers, hyphens, underscores'),
  address: z.string().min(5).max(500).trim(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email address').toLowerCase(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

export const UpdateSchoolSchema = CreateSchoolSchema.partial();

// ─── AI Schemas ────────────────────────────────────────────────────────────────

export const AiChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1).max(10000),
      }),
    )
    .min(1)
    .max(50),
  courseId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  stream: z.boolean().default(false),
});

// ─── Inferred Types ────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type CreateSchoolInput = z.infer<typeof CreateSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof UpdateSchoolSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type AiChatInput = z.infer<typeof AiChatSchema>;
