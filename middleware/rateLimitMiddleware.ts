import rateLimit from 'express-rate-limit';
import { MongoDBStore } from '@iroomit/rate-limit-mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

export const forgotPasswordLimiter = rateLimit({
    store: new MongoDBStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 60 * 60 * 1000, // 1 hour
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // Limit each IP to 5 requests per windowMs
    message: {
        message: 'Too many password reset requests from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
