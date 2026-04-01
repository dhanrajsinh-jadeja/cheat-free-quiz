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
                        hits: 100, // arbitrary high number to represent blocked state
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
                return res.status(429).json({ message });
            }
        }
    } catch (err) {}
    next();
};

// ─── 1. Forgot Password Limiter ───────────────────────────────────────────────
// 5 times in 15 minutes for each email. after that user stop to do reset password for 30 seconds
const FORGOT_PWD_BLOCK_MSG = 'Too many password reset requests. Please wait 30 seconds before trying again.';

export const forgotPwdEmailBlockCheck = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email) return next();
    const key = `forgot_pwd_block:${req.body.email.toLowerCase()}`;
    checkCustomBlock(key, req, res, next, FORGOT_PWD_BLOCK_MSG);
};

export const forgotPasswordLimiter = rateLimit({
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
        res.status(options.statusCode).json({ message: FORGOT_PWD_BLOCK_MSG });
    },
    message: { message: FORGOT_PWD_BLOCK_MSG },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});

// ─── 2. Sign In Limiter ───────────────────────────────────────────────────────
// 10 times in 1 minute then it will stopped for signin for 30 seconds by it ip.
const SIGNIN_BLOCK_MSG = 'Too many failed login attempts. Your device is temporarily blocked for 30 seconds.';

export const signInIPBlockCheck = (req: Request, res: Response, next: NextFunction) => {
    checkCustomBlock(`signin_ip_block:${ipKeyGenerator(req.ip || '')}`, req, res, next, SIGNIN_BLOCK_MSG);
};

export const signInLimiter = rateLimit({
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 60 * 1000,
    }),
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    keyGenerator: (req) => `signin_limit:${req.body.email?.toLowerCase() || ipKeyGenerator(req.ip || '')}`,
    skipSuccessfulRequests: true, // Only count failed logins
    handler: async (req, res, _next, options) => {
        await setCustomBlock(`signin_ip_block:${ipKeyGenerator(req.ip || '')}`, 30 * 1000);
        res.status(options.statusCode).json({ message: SIGNIN_BLOCK_MSG });
    },
    message: { message: SIGNIN_BLOCK_MSG },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});

// ─── 3. Sign Up Generic IP Limiter ────────────────────────────────────────────
// only 5 accounts can be create in 3 hours from any devices (per IP).
export const signUpLimiter = rateLimit({
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 3 * 60 * 60 * 1000, // 3 hours
    }),
    windowMs: 3 * 60 * 60 * 1000, // 3 hours
    max: 5,
    keyGenerator: (req) => `signup_limit_ip:${ipKeyGenerator(req.ip || '')}`,
    message: {
        message: 'You have reached the limit for account creation from this device. Please try again in 3 hours.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});

// ─── 4. Sign Up Email Limiter (Existing Email Spam) ───────────────────────────
// more then 10 times in 2 minutes then signup page should be blocked for 30 second
const SIGNUP_BLOCK_MSG = 'Too many signup attempts with existing accounts. Your device is blocked for 30 seconds.';

export const signUpIPBlockCheck = (req: Request, res: Response, next: NextFunction) => {
    checkCustomBlock(`signup_ip_block:${ipKeyGenerator(req.ip || '')}`, req, res, next, SIGNUP_BLOCK_MSG);
};

export const signUpEmailLimiter = rateLimit({
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
        res.status(options.statusCode).json({ message: SIGNUP_BLOCK_MSG });
    },
    message: { message: SIGNUP_BLOCK_MSG },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});
