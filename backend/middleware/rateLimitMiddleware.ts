import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { MongoDBStore } from '@iroomit/rate-limit-mongodb';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

// Helper to block custom keys for X seconds
const setCustomBlock = async (key: string, blockDurationMs: number) => {
    try {
        const db = mongoose.connection.db;
        if (db) {
            await db.collection('rateLimits').updateOne(
                { _id: key as any },
                { 
                    $set: { 
                        hits: 100, // represent blocked state
                        expiresAt: new Date(Date.now() + blockDurationMs) 
                    } 
                },
                { upsert: true }
            );
        }
    } catch (err) {
        // silent fail
    }
};

// Helper middleware to check if a custom block exists
const checkCustomBlock = async (key: string, _req: Request, res: Response, next: NextFunction, message: string) => {
    try {
        const db = mongoose.connection.db;
        if (db) {
            const blockDoc = await db.collection('rateLimits').findOne({ _id: key as any });
            if (blockDoc && new Date(blockDoc.expiresAt) > new Date()) {
                // Return a generic error structure to avoid clues
                return res.status(429).json({ 
                    status: 'error',
                    message,
                    code: 'LIMIT_EXCEEDED' 
                });
            }
        }
    } catch (err) {}
    next();
};

// --- Standard Settings for "Discrete Mode" ---
const discreteSettings = {
    standardHeaders: false, // Hide X-RateLimit-Limit and X-RateLimit-Remaining
    legacyHeaders: false,   // Hide X-RateLimit-Reset
    validate: { xForwardedForHeader: false },
};

// ─── 0. Global API Limiter ───────────────────────────────────────────────────
// Baseline protection for all /api endpoints
export const apiGlobalLimiter = rateLimit({
    ...discreteSettings,
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 200, // 100 requests per 15 mins
    message: { 
        status: 'error',
        message: 'System is currently busy. Please try again later.',
        code: 'BUSY'
    },
});

// ─── 1. Forgot Password Limiter ───────────────────────────────────────────────
const FORGOT_PWD_BLOCK_MSG = 'Security block: too many requests. Please wait 30 seconds.';

export const forgotPwdEmailBlockCheck = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email) return next();
    const key = `forgot_pwd_block:${req.body.email.toLowerCase()}`;
    checkCustomBlock(key, req, res, next, FORGOT_PWD_BLOCK_MSG);
};

export const forgotPasswordLimiter = rateLimit({
    ...discreteSettings,
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 15 * 60 * 1000,
    }),
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 5,
    keyGenerator: (req) => `forgot_pwd_limit:${req.body.email?.toLowerCase() || ipKeyGenerator(req.ip || '')}`,
    handler: async (req, res, _next, options) => {
        if (req.body.email) {
            await setCustomBlock(`forgot_pwd_block:${req.body.email.toLowerCase()}`, 30 * 1000);
        }
        res.status(options.statusCode).json({ 
            status: 'error',
            message: FORGOT_PWD_BLOCK_MSG,
            code: 'AUTH_TIMEOUT'
        });
    },
});

// ─── 2. Sign In Limiter ───────────────────────────────────────────────────────
const SIGNIN_BLOCK_MSG = 'Too many failed attempts. Access restricted for 30 seconds.';

export const signInIPBlockCheck = (req: Request, res: Response, next: NextFunction) => {
    checkCustomBlock(`signin_ip_block:${ipKeyGenerator(req.ip || '')}`, req, res, next, SIGNIN_BLOCK_MSG);
};

export const signInLimiter = rateLimit({
    ...discreteSettings,
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 60 * 1000,
    }),
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    keyGenerator: (req) => `signin_limit:${req.body.email?.toLowerCase() || ipKeyGenerator(req.ip || '')}`,
    skipSuccessfulRequests: true,
    handler: async (req, res, _next, options) => {
        await setCustomBlock(`signin_ip_block:${ipKeyGenerator(req.ip || '')}`, 30 * 1000);
        res.status(options.statusCode).json({ 
            status: 'error',
            message: SIGNIN_BLOCK_MSG,
            code: 'SECURITY_BLOCK'
        });
    },
});

// ─── 3. Sign Up Generic IP Limiter ────────────────────────────────────────────
export const signUpLimiter = rateLimit({
    ...discreteSettings,
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 3 * 60 * 60 * 1000, // 3 hours
    }),
    windowMs: 3 * 60 * 60 * 1000, // 3 hours
    max: 5,
    keyGenerator: (req) => `signup_limit_ip:${ipKeyGenerator(req.ip || '')}`,
    message: {
        status: 'error',
        message: 'Registration limit reached. Please try again in 3 hours.',
        code: 'REG_LIMIT'
    },
});

// ─── 4. Sign Up Email Limiter (Existing Email Spam) ───────────────────────────
const SIGNUP_BLOCK_MSG = 'Too many registration attempts. System restricted for 30 seconds.';

export const signUpIPBlockCheck = (req: Request, res: Response, next: NextFunction) => {
    checkCustomBlock(`signup_ip_block:${ipKeyGenerator(req.ip || '')}`, req, res, next, SIGNUP_BLOCK_MSG);
};

export const signUpEmailLimiter = rateLimit({
    ...discreteSettings,
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 2 * 60 * 1000, // 2 minutes
    }),
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 10,
    keyGenerator: (req) => `signup_email_limit:${req.body.email?.toLowerCase() || ipKeyGenerator(req.ip || '')}`,
    skipSuccessfulRequests: true,
    handler: async (req, res, _next, options) => {
        await setCustomBlock(`signup_ip_block:${ipKeyGenerator(req.ip || '')}`, 30 * 1000);
        res.status(options.statusCode).json({ 
            status: 'error',
            message: SIGNUP_BLOCK_MSG,
            code: 'SYSTEM_PROTECTION'
        });
    },
});

// ─── 5. Quiz Action Limiter ──────────────────────────────────────────────────
// Prevent automated quiz creation or submission spam
export const quizActionLimiter = rateLimit({
    ...discreteSettings,
    windowMs: 60 * 1000, // 1 minute
    max: 5, // max 5 sensitive quiz actions per minute
    message: {
        status: 'error',
        message: 'Action rejected: too many requests. Please wait a moment.',
        code: 'ACTION_LIMIT'
    },
});

