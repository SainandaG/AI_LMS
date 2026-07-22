export declare const API_ROUTES: {
    readonly AUTH: {
        readonly REGISTER: "/auth/register";
        readonly LOGIN: "/auth/login";
        readonly LOGOUT: "/auth/logout";
        readonly REFRESH: "/auth/refresh";
        readonly FORGOT_PASSWORD: "/auth/forgot-password";
        readonly RESET_PASSWORD: "/auth/reset-password";
        readonly VERIFY_EMAIL: "/auth/verify-email";
        readonly GOOGLE: "/auth/google";
        readonly ME: "/auth/me";
    };
    readonly USERS: {
        readonly BASE: "/users";
        readonly BY_ID: (id: string) => string;
        readonly CHANGE_PASSWORD: "/users/change-password";
        readonly UPLOAD_AVATAR: "/users/avatar";
    };
    readonly SCHOOLS: {
        readonly BASE: "/schools";
        readonly BY_ID: (id: string) => string;
    };
    readonly STUDENTS: {
        readonly BASE: "/students";
        readonly BY_ID: (id: string) => string;
    };
    readonly COURSES: {
        readonly BASE: "/courses";
        readonly BY_ID: (id: string) => string;
        readonly LESSONS: (courseId: string) => string;
    };
    readonly ATTENDANCE: {
        readonly BASE: "/attendance";
        readonly BY_CLASS: (classId: string) => string;
    };
    readonly AI: {
        readonly TUTOR: "/ai/tutor";
        readonly QUIZ: "/ai/quiz";
        readonly NOTES: "/ai/notes";
        readonly FLASHCARDS: "/ai/flashcards";
        readonly LESSON_PLAN: "/ai/lesson-plan";
        readonly RESUME_REVIEW: "/ai/resume-review";
        readonly MOCK_INTERVIEW: "/ai/mock-interview";
    };
    readonly NOTIFICATIONS: {
        readonly BASE: "/notifications";
        readonly MARK_READ: (id: string) => string;
        readonly MARK_ALL_READ: "/notifications/read-all";
    };
};
export declare const PAGINATION_DEFAULTS: {
    readonly PAGE: 1;
    readonly LIMIT: 20;
    readonly MAX_LIMIT: 100;
};
export declare const JWT_CONSTANTS: {
    readonly ACCESS_TOKEN_EXPIRY: "15m";
    readonly REFRESH_TOKEN_EXPIRY: "7d";
    readonly EMAIL_VERIFY_EXPIRY: "24h";
    readonly PASSWORD_RESET_EXPIRY: "1h";
};
export declare const OTP_CONSTANTS: {
    readonly LENGTH: 6;
    readonly EXPIRY_MINUTES: 10;
    readonly MAX_ATTEMPTS: 3;
};
export declare const UPLOAD_LIMITS: {
    readonly AVATAR_MAX_MB: 2;
    readonly DOCUMENT_MAX_MB: 10;
    readonly VIDEO_MAX_MB: 500;
    readonly ALLOWED_IMAGE_TYPES: readonly ["image/jpeg", "image/png", "image/webp"];
    readonly ALLOWED_DOCUMENT_TYPES: readonly ["application/pdf", "application/msword"];
    readonly ALLOWED_VIDEO_TYPES: readonly ["video/mp4", "video/webm"];
};
export declare const RATE_LIMITS: {
    readonly AUTH: {
        readonly WINDOW_MS: number;
        readonly MAX: 10;
    };
    readonly OTP: {
        readonly WINDOW_MS: number;
        readonly MAX: 5;
    };
    readonly API: {
        readonly WINDOW_MS: number;
        readonly MAX: 100;
    };
    readonly AI: {
        readonly WINDOW_MS: number;
        readonly MAX: 20;
    };
};
export declare const REDIS_KEYS: {
    readonly REFRESH_TOKEN: (userId: string) => string;
    readonly OTP: (email: string, purpose: string) => string;
    readonly RATE_LIMIT: (identifier: string) => string;
    readonly USER_SESSION: (sessionId: string) => string;
    readonly COURSE_CACHE: (courseId: string) => string;
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
//# sourceMappingURL=constants.d.ts.map