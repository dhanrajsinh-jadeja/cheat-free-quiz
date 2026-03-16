import { Router } from 'express';
import { signUp, login, googleLogin, forgotPassword, resetPassword, getProfile } from '../controller/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { forgotPasswordLimiter } from '../middleware/rateLimitMiddleware';

const router = Router();

// @route   POST /api/auth/signup
// @desc    Register a new user with email and password
// @access  Public
router.post('/signup', signUp);

// @route   POST /api/auth/login
// @desc    Authenticate user & get a JWT token
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/google
// @desc    Authenticate with Google OAuth token
// @access  Public
router.post('/google', googleLogin);

// @route   POST /api/auth/forgot-password
// @desc    Generate reset token and send email
// @access  Public
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Verify token and update password
// @access  Public
router.post('/reset-password/:token', resetPassword);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, getProfile);

export default router;
