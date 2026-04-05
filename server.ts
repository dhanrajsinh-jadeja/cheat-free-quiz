import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import quizRoutes from './routes/quizRoutes';
import errorMiddleware from './middleware/errorMiddleware';

// Load environment variables from the .env file into process.env
dotenv.config();

// Initialize the Express application
const app = express();

// Define the port the server will run on (falls back to 5000 if not in .env)
const PORT = process.env.PORT || 5000;

// Define the MongoDB connection string (falls back to local db if not in .env)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

import { apiGlobalLimiter } from './middleware/rateLimitMiddleware';
import { csrfProtection } from './middleware/csrfMiddleware';

// --- Middleware ---

// ... (existing manual cookie parser)

// Manual Cookie Parser (Avoiding extra package)
app.use((req: any, _res, next) => {
    const cookies: Record<string, string> = {};
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        cookieHeader.split(';').forEach((c: string) => {
            const [name, ...value] = c.split('=');
            if (name) cookies[name.trim()] = value.join('=').trim();
        });
    }
    req.cookies = cookies;
    next();
});

// Use Helmet for security headers + Strict CSP
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "https://accounts.google.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "img-src": ["'self'", "data:", "https://lh3.googleusercontent.com"],
            "connect-src": ["'self'", "https://accounts.google.com"],
            "frame-src": ["'self'", "https://accounts.google.com"],
        },
    },
}));

// Use compression for Gzip/Brotli response compression
app.use(compression());

// Global Rate Limiter for all API routes
app.use('/api', apiGlobalLimiter);

// 🛡️ Global Anti-CSRF Protection for all state-changing API routes
app.use('/api', (req, res, next) => {
    // Exclude initial auth and token-retrieval endpoints from CSRF check
    const excludePaths = ['/auth/login', '/auth/signup', '/auth/google', '/auth/csrf-token'];
    if (excludePaths.some(p => req.path.includes(p))) {
        return next();
    }
    csrfProtection(req, res, next);
});

// Trust proxy is required for express-rate-limit to correctly identify IPs
app.set('trust proxy', 1);

// Enable CORS and expose Content-Disposition so the frontend can read the CSV filename
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    exposedHeaders: ['Content-Disposition'],
    credentials: true
};
app.use(cors(corsOptions));

// Parse incoming JSON payloads in the request body
app.use(express.json());

// --- Routes ---
// Mount authentication-related routes (signup, login, google login) under /api/auth
app.use('/api/auth', authRoutes);
// Mount quiz-related routes (create, get, publish, fetch my quizzes) under /api/quiz
app.use('/api/quiz', quizRoutes);

// --- Health check endpoint ---
// A simple endpoint to verify the server is running and responsive
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Error Handling ---
// Global error middleware should be the last middleware
app.use(errorMiddleware);

// --- Database Connection & Server Start ---
// Attempt to connect to MongoDB using Mongoose
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        // Once connected to the database, start starting the Express server to listen for requests
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        // If the database connection fails, log the error and exit the process
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
