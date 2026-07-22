import { z } from 'zod';
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    sortBy?: string | undefined;
}, {
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const IdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    phone?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    phone?: string | undefined;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const ResetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
    confirmPassword: string;
}, {
    password: string;
    token: string;
    confirmPassword: string;
}>, {
    password: string;
    token: string;
    confirmPassword: string;
}, {
    password: string;
    token: string;
    confirmPassword: string;
}>;
export declare const VerifyEmailSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const ChangePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>;
export declare const CreateSchoolSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    address: z.ZodString;
    phone: z.ZodString;
    email: z.ZodString;
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    code: string;
    email: string;
    phone: string;
    name: string;
    address: string;
    website?: string | undefined;
}, {
    code: string;
    email: string;
    phone: string;
    name: string;
    address: string;
    website?: string | undefined;
}>;
export declare const UpdateSchoolSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
}, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    name?: string | undefined;
    address?: string | undefined;
    website?: string | undefined;
}, {
    code?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    name?: string | undefined;
    address?: string | undefined;
    website?: string | undefined;
}>;
export declare const AiChatSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant", "system"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "assistant" | "system";
        content: string;
    }, {
        role: "user" | "assistant" | "system";
        content: string;
    }>, "many">;
    courseId: z.ZodOptional<z.ZodString>;
    studentId: z.ZodOptional<z.ZodString>;
    stream: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    messages: {
        role: "user" | "assistant" | "system";
        content: string;
    }[];
    stream: boolean;
    courseId?: string | undefined;
    studentId?: string | undefined;
}, {
    messages: {
        role: "user" | "assistant" | "system";
        content: string;
    }[];
    courseId?: string | undefined;
    studentId?: string | undefined;
    stream?: boolean | undefined;
}>;
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
//# sourceMappingURL=schemas.d.ts.map