import express from 'express';
import { createQuiz, getQuiz, publishQuiz, getMyQuizzes } from '../controller/quizController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/:id', getQuiz);

// Protected routes
router.post('/', authMiddleware, createQuiz);
router.post('/:id/publish', authMiddleware, publishQuiz);
router.get('/my/all', authMiddleware, getMyQuizzes);

export default router;
