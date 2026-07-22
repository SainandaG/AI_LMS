"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatSchema = exports.UpdateSchoolSchema = exports.CreateSchoolSchema = exports.ChangePasswordSchema = exports.RefreshTokenSchema = exports.VerifyEmailSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.LoginSchema = exports.RegisterSchema = exports.IdParamSchema = exports.PaginationSchema = void 0;
const zod_1 = require("zod");
// ─── Common ────────────────────────────────────────────────────────────────────
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid ID format'),
});
// ─── Auth Schemas ──────────────────────────────────────────────────────────────
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').toLowerCase(),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain uppercase, lowercase, number, and special character'),
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters').max(50).trim(),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters').max(50).trim(),
    phone: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number')
        .optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').toLowerCase(),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').toLowerCase(),
});
exports.ResetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
exports.VerifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Verification token is required'),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.ChangePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
// ─── School Schemas ────────────────────────────────────────────────────────────
exports.CreateSchoolSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200).trim(),
    code: zod_1.z
        .string()
        .min(2)
        .max(20)
        .toUpperCase()
        .regex(/^[A-Z0-9_-]+$/, 'School code can only contain letters, numbers, hyphens, underscores'),
    address: zod_1.z.string().min(5).max(500).trim(),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
    email: zod_1.z.string().email('Invalid email address').toLowerCase(),
    website: zod_1.z.string().url('Invalid website URL').optional().or(zod_1.z.literal('')),
});
exports.UpdateSchoolSchema = exports.CreateSchoolSchema.partial();
// ─── AI Schemas ────────────────────────────────────────────────────────────────
exports.AiChatSchema = zod_1.z.object({
    messages: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant', 'system']),
        content: zod_1.z.string().min(1).max(10000),
    }))
        .min(1)
        .max(50),
    courseId: zod_1.z.string().uuid().optional(),
    studentId: zod_1.z.string().uuid().optional(),
    stream: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=schemas.js.map