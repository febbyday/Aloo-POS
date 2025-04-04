// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { setCsrfToken } from '../middleware/csrf';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/verify', AuthController.verify);
router.get('/csrf-token', setCsrfToken, AuthController.setCsrfCookie);
router.post('/clear-cookies', AuthController.clearCookies);

// Session Management (authenticated routes)
router.get('/sessions', authenticate, AuthController.getUserSessions);
router.delete('/sessions/:sessionId', authenticate, AuthController.terminateSession);
router.delete('/sessions', authenticate, AuthController.terminateAllSessions);

export default router;
