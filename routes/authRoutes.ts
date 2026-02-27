import { Router } from 'express';
import { signUp, login, googleLogin } from '../controller/authController';

const router = Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', signUp);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', login);

// @route   POST /api/auth/google
// @desc    Authenticate with Google
router.post('/google', googleLogin);

export default router;
