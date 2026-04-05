import { Router } from 'express';
import { signUp, login, googleLogin, forgotPassword, resetPassword, getProfile, logout, getCsrfToken } from '../controller/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { 
    forgotPwdEmailBlockCheck, forgotPasswordLimiter, 
    signInIPBlockCheck, signInLimiter, 
    signUpIPBlockCheck, signUpEmailLimiter, signUpLimiter 
} from '../middleware/rateLimitMiddleware';

const router = Router();

// @route   GET /api/auth/csrf-token
// @desc    Get fresh anti-CSRF token
// @access  Public
router.get('/csrf-token', getCsrfToken);

// @route   POST /api/auth/signup
// @desc    Register a new user with email and password
// @access  Public
router.post('/signup', signUpIPBlockCheck, signUpEmailLimiter, signUpLimiter, signUp);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post('/logout', logout);

// @route   POST /api/auth/login
// @desc    Authenticate user & get a JWT token
// @access  Public
router.post('/login', signInIPBlockCheck, signInLimiter, login);

// @route   POST /api/auth/google
// @desc    Authenticate with Google OAuth token
// @access  Public
router.post('/google', signInIPBlockCheck, signInLimiter, googleLogin);

// @route   POST /api/auth/forgot-password
// @desc    Generate reset token and send email
// @access  Public
router.post('/forgot-password', forgotPwdEmailBlockCheck, forgotPasswordLimiter, forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Verify token and update password
// @access  Public
router.post('/reset-password/:token', forgotPasswordLimiter, resetPassword);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, getProfile);

export default router;
