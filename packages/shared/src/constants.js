"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.REDIS_KEYS = exports.RATE_LIMITS = exports.UPLOAD_LIMITS = exports.OTP_CONSTANTS = exports.JWT_CONSTANTS = exports.PAGINATION_DEFAULTS = exports.API_ROUTES = void 0;
// API base paths
exports.API_ROUTES = {
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
        BY_ID: (id) => `/users/${id}`,
        CHANGE_PASSWORD: '/users/change-password',
        UPLOAD_AVATAR: '/users/avatar',
    },
    SCHOOLS: {
        BASE: '/schools',
        BY_ID: (id) => `/schools/${id}`,
    },
    STUDENTS: {
        BASE: '/students',
        BY_ID: (id) => `/students/${id}`,
    },
    COURSES: {
        BASE: '/courses',
        BY_ID: (id) => `/courses/${id}`,
        LESSONS: (courseId) => `/courses/${courseId}/lessons`,
    },
    ATTENDANCE: {
        BASE: '/attendance',
        BY_CLASS: (classId) => `/attendance/class/${classId}`,
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
        MARK_READ: (id) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
    },
};
// Pagination defaults
exports.PAGINATION_DEFAULTS = {
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100,
};
// JWT constants
exports.JWT_CONSTANTS = {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    EMAIL_VERIFY_EXPIRY: '24h',
    PASSWORD_RESET_EXPIRY: '1h',
};
// OTP constants
exports.OTP_CONSTANTS = {
    LENGTH: 6,
    EXPIRY_MINUTES: 10,
    MAX_ATTEMPTS: 3,
};
// Upload limits
exports.UPLOAD_LIMITS = {
    AVATAR_MAX_MB: 2,
    DOCUMENT_MAX_MB: 10,
    VIDEO_MAX_MB: 500,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
};
// Rate limiting
exports.RATE_LIMITS = {
    AUTH: { WINDOW_MS: 15 * 60 * 1000, MAX: 10 }, // 10 per 15 min
    OTP: { WINDOW_MS: 60 * 60 * 1000, MAX: 5 }, // 5 per hour
    API: { WINDOW_MS: 60 * 1000, MAX: 100 }, // 100 per minute
    AI: { WINDOW_MS: 60 * 1000, MAX: 20 }, // 20 per minute
};
// Redis key prefixes
exports.REDIS_KEYS = {
    REFRESH_TOKEN: (userId) => `refresh_token:${userId}`,
    OTP: (email, purpose) => `otp:${email}:${purpose}`,
    RATE_LIMIT: (identifier) => `rate_limit:${identifier}`,
    USER_SESSION: (sessionId) => `session:${sessionId}`,
    COURSE_CACHE: (courseId) => `course:${courseId}`,
};
// HTTP status codes for type safety
exports.HTTP_STATUS = {
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
};
//# sourceMappingURL=constants.js.map