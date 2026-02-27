import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-123';

/**
 * Handle Google Login/Signup
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { credential } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400).json({ message: 'Invalid Google token' });
            return;
        }

        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Create user for first-time Google sign-in
            user = new User({
                fullName: name,
                email: email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
                avatar: picture,
                isEmailVerified: true
            });
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Google login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Error during Google authentication' });
    }
};

/**
 * Handle user registration
 */
export const signUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullName, email, password } = req.body;

        // 1. Basic Validation
        if (!fullName || !email || !password) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create and save user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        // 5. Generate JWT Token
        const token = jwt.sign(
            { id: savedUser._id, email: savedUser.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 6. Return response (exclude password)
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: savedUser._id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                avatar: savedUser.avatar,
                createdAt: savedUser.createdAt,
            },
        });
    } catch (error: any) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

/**
 * Handle user login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error during login' });
    }
};
