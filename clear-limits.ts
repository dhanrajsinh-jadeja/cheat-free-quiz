import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

async function clearLimits() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        if (db) {
            await db.collection('rateLimits').deleteMany({});
            console.log('Successfully cleared all rate limits from MongoDB.');
        }
    } catch (e) {
        console.error('Error clearing rate limits:', e);
    } finally {
        await mongoose.disconnect();
    }
}

clearLimits();
