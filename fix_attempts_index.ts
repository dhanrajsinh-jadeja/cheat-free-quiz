
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

async function checkIndex() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        const db = mongoose.connection.db;
        if (!db) throw new Error('No DB connection');
        
        const indexes = await db.collection('attempts').indexes();
        console.log('Current Indexes on attempts collection:');
        console.log(JSON.stringify(indexes, null, 2));

        const uniqueQuizUser = indexes.find(idx => idx.name === 'quiz_1_user_1' || (idx.key.quiz === 1 && idx.key.user === 1 && idx.unique));
        
        if (uniqueQuizUser && uniqueQuizUser.name) {
            console.log('⚠️  FOUND UNIQUE INDEX:', uniqueQuizUser.name, '. This will block multiple attempts.');
            console.log('Dropping index...');
            await db.collection('attempts').dropIndex(uniqueQuizUser.name);
            console.log('✅ Index dropped successfully!');
        } else {
            console.log('✅ No unique index found on (quiz, user).');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkIndex();
