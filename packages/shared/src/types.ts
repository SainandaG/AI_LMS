import { UserRole, AccountStatus, Gender } from './enums';

// ─── Base Types ────────────────────────────────────────────────────────────────

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDelete extends Timestamps {
  deletedAt: Date | null;
}

// ─── User Types ────────────────────────────────────────────────────────────────

export interface User extends SoftDelete {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: AccountStatus;
  gender: Gender | null;
  phone: string | null;
  avatar: string | null;
  schoolId: string | null;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
}

export interface PublicUser
  extends Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'avatar'> {}

// ─── Auth Types ────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: UserRole;
  schoolId: string | null;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── School Types ──────────────────────────────────────────────────────────────

export interface School extends SoftDelete {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  website: string | null;
  logo: string | null;
  isActive: boolean;
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiChatRequest {
  messages: AiMessage[];
  courseId?: string;
  studentId?: string;
  stream?: boolean;
}

export interface AiChatResponse {
  message: string;
  sources?: AiSource[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AiSource {
  documentId: string;
  title: string;
  snippet: string;
  score: number;
}

// ─── Notification Types ────────────────────────────────────────────────────────

export interface Notification extends Timestamps {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  data: Record<string, unknown> | null;
}
