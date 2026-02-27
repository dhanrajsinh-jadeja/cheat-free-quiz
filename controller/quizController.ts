import { Request, Response } from 'express';
import Quiz from '../models/quizModel';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Create a new quiz
 */
export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, category, timeLimit, totalMarks, passingMarks, questions } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const newQuiz = new Quiz({
            title,
            description,
            category,
            timeLimit,
            totalMarks,
            passingMarks,
            creator: req.user.id,
            questions,
            isPublished: false,
            isActive: true
        });

        await newQuiz.save();
        res.status(201).json(newQuiz);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating quiz', error: error.message });
    }
};

/**
 * Get a quiz by ID (for students taking it)
 */
export const getQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        // Check if quiz is published
        if (!quiz.isPublished) {
            res.status(403).json({ message: 'Quiz is not published yet' });
            return;
        }

        // Check if quiz has expired
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
 * Publish a quiz and set expiration
 */
export const publishQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        // Verify creator
        if (quiz.creator.toString() !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to publish this quiz' });
            return;
        }

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + quiz.timeLimit * 60000);

        quiz.isPublished = true;
        quiz.startDate = startDate;
        quiz.endDate = endDate;

        await quiz.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.json({
            message: 'Quiz published successfully',
            quizLink: `${frontendUrl}/quiz-rules/${quiz._id}`,
            expiresAt: endDate
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error publishing quiz', error: error.message });
    }
};

/**
 * Get all quizzes created by the user
 */
export const getMyQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const quizzes = await Quiz.find({ creator: req.user.id });
        res.json(quizzes);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching your quizzes', error: error.message });
    }
};
