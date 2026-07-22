import { Router, IRouter } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '@/shared/middleware/auth.middleware';

export const authRouter: IRouter = Router();

// ─── Public Routes ─────────────────────────────────────────────────────────
authRouter.post('/register', (req, res) => authController.register(req, res));
authRouter.post('/login', (req, res) => authController.login(req, res));
authRouter.post('/refresh', (req, res) => authController.refreshTokens(req, res));
authRouter.post('/logout', (req, res) => authController.logout(req, res));
authRouter.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
authRouter.post('/reset-password', (req, res) => authController.resetPassword(req, res));
authRouter.post('/resend-verification', (req, res) => authController.resendVerification(req, res));

// ─── Protected Routes ───────────────────────────────────────────────────────
authRouter.use(authenticate);
authRouter.get('/me', (req, res) => authController.getMe(req, res));
authRouter.post('/verify-email', (req, res) => authController.verifyEmail(req, res));
authRouter.post('/logout-all', (req, res) => authController.logoutAll(req, res));
