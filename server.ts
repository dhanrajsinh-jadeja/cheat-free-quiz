import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import quizRoutes from './routes/quizRoutes';

// Load environment variables from the .env file into process.env
dotenv.config();

// Initialize the Express application
const app = express();

// Define the port the server will run on (falls back to 5000 if not in .env)
const PORT = process.env.PORT || 5000;

// Define the MongoDB connection string (falls back to local db if not in .env)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

// --- Middleware ---
// Enable CORS (Cross-Origin Resource Sharing) so the frontend can make requests to this API
app.use(cors());
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
