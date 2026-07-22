import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Environment variable schema — validated at startup, app will crash with a clear message if misconfigured
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),

  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EMAIL_SECRET: z.string().min(32, 'JWT_EMAIL_SECRET must be at least 32 characters'),

  // Client URLs
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((val) => val.split(',').map((s) => s.trim())),

  // Email
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  EMAIL_FROM: z.string().default('noreply@ailms.dev'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/auth/google/callback'),

  // Groq AI
  GROQ_API_KEY: z.string().default(''),
  GROQ_MODEL: z.string().default('llama-3.1-8b-instant'),

  // OpenAI
  OPENAI_API_KEY: z.string().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),

  // App
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof EnvSchema>;
