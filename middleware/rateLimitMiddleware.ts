import rateLimit from 'express-rate-limit';
import { MongoDBStore } from '@iroomit/rate-limit-mongodb';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

export const forgotPasswordLimiter = rateLimit({
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 60 * 60 * 1000, // 1 hour
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // Limit each IP to 2 requests per windowMs
    message: {
        message: 'Too many password reset requests from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
});

export const signUpLimiter = rateLimit({
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 24 * 60 * 60 * 1000, // 24 hours
    }),
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5,
    message: {
        message: 'You have reached the daily limit for account creation. Please try again tomorrow.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
});

export const signInLimiter = rateLimit({
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 30 * 60 * 1000, // 30 minutes
    }),
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5,
    keyGenerator: (req) => req.body.email || req.ip, // Use email as key, fallback to IP
    skipSuccessfulRequests: true, // Only count failed attempts (status >= 400)
    message: {
        message: 'Too many failed login attempts. Your account is temporarily blocked for 30 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
});

/**
 * Limit sign-ups by email.
 * If someone tries the same email 2 times in 1 hour, block their IP from signing up for 1 hour.
 */
export const signUpEmailLimiter = rateLimit({
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 60 * 60 * 1000, // 1 hour
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2,
    keyGenerator: (req) => `signup_email:${req.body.email}`,
    handler: async (req, res, _next, options) => {
        // When limit is reached, also block the IP explicitly for 1 hour
        const store = options.store as MongoDBStore;
        const ipKey = `signup_ip_block:${req.ip}`;
        
        try {
            const db = (store as any).db || mongoose.connection.db;
            if (db) {
                await db.collection('rateLimits').updateOne(
                    { _id: ipKey },
                    { 
                        $set: { 
                            hits: 100, // Set high to ensure block
                            expiresAt: new Date(Date.now() + 60 * 60 * 1000) 
                        } 
                    },
                    { upsert: true }
                );
            }
        } catch (err) {
            // Error handled silently
        }

        res.status(options.statusCode).json(options.message);
    },
    message: {
        message: 'Too many signup attempts for this email. This device is now blocked from signing up for 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    validate: { trustProxy: false },
});

/**
 * Middleware to check if the current IP is blocked from signing up
 */
export const signUpIPBlockCheck = async (req: any, res: any, next: any) => {
    try {
        const db = mongoose.connection.db;
        if (db) {
            const ipKey = `signup_ip_block:${req.ip}`;
            const blockDoc = await db.collection('rateLimits').findOne({ _id: ipKey as any });
            if (blockDoc && new Date(blockDoc.expiresAt) > new Date()) {
                return res.status(429).json({
                    message: 'This device is temporarily blocked from signing up for 1 hour due to unusual activity.'
                });
            }
        }
    } catch (err) {
        // Error handled silently
    }
    next();
};
