import { Request, Response } from 'express';
import Quiz from '../models/quizModel';
import Attempt from '../models/attemptModel';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Create a new quiz
 * Accessible only by authenticated users. Saves a draft quiz to the database.
 */
export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, category, timeLimit, totalMarks, passingMarks, maxAttempts, questions } = req.body;

        // Ensure the user is authenticated and attached to the request by the authMiddleware
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Construct the new Quiz document
        const newQuiz = new Quiz({
            title,
            description,
            category,
            timeLimit,
            totalMarks,
            passingMarks,
            maxAttempts: maxAttempts || 0,
            creator: req.user.id, // Tie the quiz to the user who created it
            questions,
            isPublished: false, // Quizzes default to a draft state
            isActive: true
        });

        // Save to MongoDB
        await newQuiz.save();
        res.status(201).json(newQuiz);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating quiz', error: error.message });
    }
};

/**
 * Get a quiz by ID 
 * Typically used by students taking the quiz, or creators previewing it.
 */
export const getQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch quiz by its unique MongoDB ObjectId
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        // Security check: Only return the quiz to standard users if it has been published
        if (!quiz.isPublished) {
            res.status(403).json({ message: 'Quiz is not published yet' });
            return;
        }

        // Security check: If the quiz has a scheduled start time, block it if it hasn't started
        if (quiz.startDate && new Date() < quiz.startDate) {
            res.status(403).json({ 
                message: 'Quiz has not started yet', 
                startDate: quiz.startDate 
            });
            return;
        }

        // Security check: If the quiz has a strict end time, block it if it's expired
        if (quiz.endDate && new Date() > quiz.endDate) {
            res.status(410).json({ message: 'Quiz has expired' });
            return;
        }

        res.json(quiz);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching quiz', error: error.message });
    }
};

/**
 * Publish a quiz
 * Transitions a quiz from 'draft' to 'published' and sets its start/end window based on its time limit.
 */
export const publishQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        // Security Check: Verify that the user attempting to publish is the actual creator of the quiz
        if (quiz.creator.toString() !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to publish this quiz' });
            return;
        }

        // Validation before publishing
        if (!quiz.title.trim()) {
            res.status(400).json({ message: 'Quiz title is required' });
            return;
        }

        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            const qNum = i + 1;

            if (!q.text.trim()) {
                res.status(400).json({ message: `Question ${qNum} text is required` });
                return;
            }

            if (['mcq', 'multi-mcq', 'tf'].includes(q.type)) {
                if (!q.correctAnswers || q.correctAnswers.length === 0) {
                    res.status(400).json({ message: `Question ${qNum} (${q.type.toUpperCase()}) must have at least one correct answer selected` });
                    return;
                }

                if (['mcq', 'multi-mcq'].includes(q.type)) {
                    const filledOptions = q.options.filter(opt => opt.trim() !== '');
                    if (filledOptions.length < 2) {
                        res.status(400).json({ message: `Question ${qNum} (${q.type.toUpperCase()}) must have at least two options filled` });
                        return;
                    }
                }
            }
        }

        // Calculate the availability window for the quiz
        const { startDate: customStart, endDate: customEnd } = req.body;
        
        const startDate = customStart ? new Date(customStart) : new Date();
        const endDate = customEnd ? new Date(customEnd) : undefined;

        quiz.isPublished = true;
        quiz.startDate = startDate;
        quiz.endDate = endDate;
        quiz.publishedAt = new Date();

        await quiz.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.json({
            message: 'Quiz published successfully',
            quizLink: `${frontendUrl}/quiz-rules/${quiz._id}`, // Generate a shareable link
            expiresAt: endDate
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error publishing quiz', error: error.message });
    }
};

/**
 * Get all quizzes created by the logged-in user
 * Used by the creator dashboard.
 */
export const getMyQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Ensure user is verified by middleware
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Find all quizzes where the generic creator ID matches the logged-in user's ID
        const quizzes = await Quiz.find({ creator: req.user.id });
        res.json(quizzes);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching your quizzes', error: error.message });
    }
};

/**
 * Get statistics for the logged-in user (Student Perspective)
 */
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.id;

        // Fetch all completed attempts for the user
        const attempts = await Attempt.find({ user: userId, status: 'COMPLETED' })
            .populate('quiz', 'title category')
            .sort({ endTime: -1 });

        if (attempts.length === 0) {
            res.json({
                totalQuizzesTaken: 0,
                averageScore: 0,
                completedTopics: 0,
                recentActivity: []
            });
            return;
        }

        const totalQuizzesTaken = attempts.length;
        const totalScore = attempts.reduce((acc, curr) => acc + (curr.score / curr.totalMarks) * 100, 0);
        const averageScore = Math.round(totalScore / totalQuizzesTaken);

        // Extract unique categories from populated quiz data
        const categories = new Set(attempts.map(a => (a.quiz as any)?.category).filter(Boolean));
        const completedTopics = categories.size;

        // Get 5 most recent activities
        const recentActivity = attempts.slice(0, 5).map(a => ({
            id: a._id,
            quizId: (a.quiz as any)?._id,
            title: (a.quiz as any)?.title,
            category: (a.quiz as any)?.category,
            score: a.score,
            totalMarks: a.totalMarks,
            percentage: Math.round((a.score / a.totalMarks) * 100),
            date: a.endTime
        }));

        res.json({
            totalQuizzesTaken,
            averageScore,
            completedTopics,
            recentActivity,
            attemptHistory: attempts.map(a => ({
                id: a._id,
                quizId: (a.quiz as any)?._id,
                title: (a.quiz as any)?.title,
                category: (a.quiz as any)?.category,
                score: a.score,
                totalMarks: a.totalMarks,
                percentage: Math.round((a.score / a.totalMarks) * 100),
                date: a.endTime
            }))
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching user statistics', error: error.message });
    }
};

/**
 * Delete a quiz
 * Authenticated users can delete their own quizzes.
 */
export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        // Security Check: Only the creator can delete the quiz
        if (quiz.creator.toString() !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to delete this quiz' });
            return;
        }

        await Quiz.findByIdAndDelete(req.params.id);
        
        // Note: Associated attempts could also be deleted here if required
        // await Attempt.deleteMany({ quiz: req.params.id });

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting quiz', error: error.message });
    }
};

/**
 * Bulk delete quizzes
 * Deletes multiple quizzes if they belong to the authenticated user.
 */
export const deleteQuizzesBatch = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: 'No quiz IDs provided' });
            return;
        }

        // Only delete quizzes that belong to this user
        const result = await Quiz.deleteMany({
            _id: { $in: ids },
            creator: req.user?.id
        });

        res.json({ 
            message: 'Quizzes deleted successfully', 
            deletedCount: result.deletedCount 
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting quizzes', error: error.message });
    }
};

/**
 * Get attempt status for a user on a specific quiz
 */
export const getAttemptStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const quizId = req.params.id;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        const attemptCount = await Attempt.countDocuments({
            quiz: quizId,
            user: userId,
            status: { $in: ['COMPLETED', 'AUTO_SUBMITTED'] } // Count finished attempts
        });

        const canAttempt = quiz.maxAttempts === 0 || attemptCount < quiz.maxAttempts;

        res.json({
            attemptCount,
            maxAttempts: quiz.maxAttempts,
            canAttempt
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error checking attempt status', error: error.message });
    }
};

/**
 * Update an existing quiz
 */
export const updateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        // Security Check: Only the creator can update the quiz
        if (quiz.creator.toString() !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to update this quiz' });
            return;
        }

        // Restriction Check: Block editing if the quiz is already active/open (Removed as per user request to allow editing with confirmation)
        /*
        if (quiz.isPublished && quiz.startDate && new Date() >= quiz.startDate) {
            res.status(403).json({ 
                message: 'Cannot edit an active quiz. Only quizzes that have not yet started can be modified.' 
            });
            return;
        }
        */

        const { title, description, category, timeLimit, totalMarks, passingMarks, maxAttempts, questions, tags, negativeMarking, randomization, antiCheat } = req.body;

        // Update fields if provided
        if (title !== undefined) quiz.title = title;
        if (description !== undefined) quiz.description = description;
        if (category !== undefined) quiz.category = category;
        if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
        if (totalMarks !== undefined) quiz.totalMarks = totalMarks;
        if (passingMarks !== undefined) quiz.passingMarks = passingMarks;
        if (maxAttempts !== undefined) quiz.maxAttempts = maxAttempts;
        if (questions !== undefined) quiz.questions = questions;
        if (tags !== undefined) quiz.tags = tags;
        if (negativeMarking !== undefined) quiz.negativeMarking = negativeMarking;
        if (randomization !== undefined) quiz.randomization = randomization;
        if (antiCheat !== undefined) quiz.antiCheat = antiCheat;

        await quiz.save();
        res.json({ message: 'Quiz updated successfully', quiz });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating quiz', error: error.message });
    }
};
