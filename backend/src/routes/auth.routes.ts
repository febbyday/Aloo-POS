import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { setCsrfToken, validateCsrfToken } from '../middleware/csrf';
import { authenticate } from '../middleware/auth';

const router = Router();

// CSRF token route - must be before validateCsrfToken middleware
router.get('/csrf-token', setCsrfToken, AuthController.setCsrfCookie);

// Apply CSRF protection to all routes
router.use(setCsrfToken);
router.use(validateCsrfToken);

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/verify', AuthController.verify);
router.post('/clear-cookies', AuthController.clearCookies);

// Session Management (authenticated routes)
router.get('/sessions', authenticate, AuthController.getUserSessions);
router.delete('/sessions/:sessionId', authenticate, AuthController.terminateSession);
router.delete('/sessions', authenticate, AuthController.terminateAllSessions);

export default router;
