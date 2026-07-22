// API base paths
export const API_ROUTES = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    GOOGLE: '/auth/google',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
  },
  SCHOOLS: {
    BASE: '/schools',
    BY_ID: (id: string) => `/schools/${id}`,
  },
  STUDENTS: {
    BASE: '/students',
    BY_ID: (id: string) => `/students/${id}`,
  },
  COURSES: {
    BASE: '/courses',
    BY_ID: (id: string) => `/courses/${id}`,
    LESSONS: (courseId: string) => `/courses/${courseId}/lessons`,
  },
  ATTENDANCE: {
    BASE: '/attendance',
    BY_CLASS: (classId: string) => `/attendance/class/${classId}`,
  },
  AI: {
    TUTOR: '/ai/tutor',
    QUIZ: '/ai/quiz',
    NOTES: '/ai/notes',
    FLASHCARDS: '/ai/flashcards',
    LESSON_PLAN: '/ai/lesson-plan',
    RESUME_REVIEW: '/ai/resume-review',
    MOCK_INTERVIEW: '/ai/mock-interview',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// JWT constants
export const JWT_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  EMAIL_VERIFY_EXPIRY: '24h',
  PASSWORD_RESET_EXPIRY: '1h',
} as const;

// OTP constants
export const OTP_CONSTANTS = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
} as const;

// Upload limits
export const UPLOAD_LIMITS = {
  AVATAR_MAX_MB: 2,
  DOCUMENT_MAX_MB: 10,
  VIDEO_MAX_MB: 500,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
} as const;

// Rate limiting
// NOTE: These are generous dev-mode limits. Tighten before production.
export const RATE_LIMITS = {
  AUTH: { WINDOW_MS: 15 * 60 * 1000, MAX: 200 },       // 200 per 15 min (was 10)
  OTP:  { WINDOW_MS: 60 * 60 * 1000, MAX: 50  },        // 50 per hour (was 5)
  API:  { WINDOW_MS: 60 * 1000,      MAX: 1000 },        // 1000 per minute (was 100)
  AI:   { WINDOW_MS: 60 * 1000,      MAX: 100  },        // 100 per minute (was 20)
} as const;

// Redis key prefixes
export const REDIS_KEYS = {
  REFRESH_TOKEN: (userId: string) => `refresh_token:${userId}`,
  OTP: (email: string, purpose: string) => `otp:${email}:${purpose}`,
  RATE_LIMIT: (identifier: string) => `rate_limit:${identifier}`,
  USER_SESSION: (sessionId: string) => `session:${sessionId}`,
  COURSE_CACHE: (courseId: string) => `course:${courseId}`,
} as const;

// HTTP status codes for type safety
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
