import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from './models/quizModel';
import Attempt from './models/attemptModel';

// Load environment variables from .env
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

async function diagnose() {
  console.log('--- Database Analytics Diagnosis ---');
  console.log('Connecting to MongoDB...');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.\n');

    // 1. Quiz Statistics
    const totalQuizzes = await Quiz.countDocuments();
    const publishedQuizzes = await Quiz.countDocuments({ isPublished: true });
    
    console.log(`[QUIZZES]`);
    console.log(`Total Quizzes: ${totalQuizzes}`);
    console.log(`Published Quizzes: ${publishedQuizzes}`);
    console.log(`Draft Quizzes: ${totalQuizzes - publishedQuizzes}\n`);

    // 2. Attempt Statistics
    const totalAttempts = await Attempt.countDocuments();
    const completedAttempts = await Attempt.countDocuments({ status: { $in: ['COMPLETED', 'AUTO_SUBMITTED'] } });
    const inProgressAttempts = await Attempt.countDocuments({ status: 'IN_PROGRESS' });

    console.log(`[ATTEMPTS]`);
    console.log(`Total Attempts: ${totalAttempts}`);
    console.log(`Completed: ${completedAttempts}`);
    console.log(`In Progress: ${inProgressAttempts}\n`);

    if (completedAttempts > 0) {
      const attempts = await Attempt.find({ status: { $in: ['COMPLETED', 'AUTO_SUBMITTED'] } });
      
      // Calculate global average score across all completed attempts
      // Fixing the 'implicit any' issue by providing types for the reducer
      const totalScorePercent = attempts.reduce((acc: number, curr: any) => {
        const marks = curr.totalMarks || 1;
        return acc + (curr.score / marks) * 100;
      }, 0);
      
      const avgScore = Math.round(totalScorePercent / completedAttempts);
      const passedAttempts = attempts.filter((a: any) => a.isPassed).length;
      const passRate = Math.round((passedAttempts / completedAttempts) * 100);

      console.log(`[METRICS]`);
      console.log(`Global Average Score: ${avgScore}%`);
      console.log(`Global Pass Rate: ${passRate}%\n`);
    }

    // 3. Data Integrity Checks
    console.log(`[INTEGRITY CHECKS]`);
    
    // Check for orphaned attempts (attempts pointing to non-existent quizzes)
    const allAttempts = await Attempt.find({}, 'quiz').lean();
    let orphanedCount = 0;
    
    for (const attempt of allAttempts) {
      const quizExists = await Quiz.exists({ _id: attempt.quiz });
      if (!quizExists) {
        orphanedCount++;
      }
    }

    if (orphanedCount > 0) {
      console.warn(`⚠️  Warning: Found ${orphanedCount} orphaned attempts (quizzes no longer exist).`);
    } else {
      console.log(`✅ No orphaned attempts found.`);
    }

    // Check for attempts with mismatched totalMarks
    const mismatchedMarks = await Attempt.countDocuments({ totalMarks: { $lte: 0 } });
    if (mismatchedMarks > 0) {
      console.warn(`⚠️  Warning: Found ${mismatchedMarks} attempts with zero or negative total marks.`);
    } else {
      console.log(`✅ All attempts have valid total marks.`);
    }

  } catch (error: any) {
    console.error('❌ Error during diagnosis:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
    process.exit(0);
  }
}

diagnose();
