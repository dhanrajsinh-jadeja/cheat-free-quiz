import express from 'express';
import { createQuiz, getQuiz, publishQuiz, getMyQuizzes, getUserStats, deleteQuiz, deleteQuizzesBatch, getAttemptStatus, updateQuiz } from '../controller/quizController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// --- Public Routes ---
// @route   GET /api/quiz/:id
// @desc    Fetch a specific quiz by its ID (typically used by students taking the quiz, or for preview)
// @access  Public (the controller enforces that it must be 'published' to be viewed)
router.get('/:id', getQuiz);

// --- Protected Routes (Require Authentication) ---
// @route   POST /api/quiz/
// @desc    Create a new quiz draft
// @access  Private (Requires JWT)
router.post('/', authMiddleware, createQuiz);

// @route   POST /api/quiz/:id/publish
// @desc    Publish a drafted quiz, making it available to students and generating a link
// @access  Private (Requires JWT, must be the creator of the quiz)
router.post('/:id/publish', authMiddleware, publishQuiz);

// @access  Private (Requires JWT)
router.get('/my/all', authMiddleware, getMyQuizzes);

// @access  Private (Requires JWT)
router.get('/stats/user', authMiddleware, getUserStats);

// @route   GET /api/quiz/:id/attempt-status
// @desc    Check if user can attempt the quiz again
// @access  Private (Requires JWT)
router.get('/:id/attempt-status', authMiddleware, getAttemptStatus);

// @route   DELETE /api/quiz/:id
// @desc    Delete a quiz
// @access  Private (Requires JWT, must be the creator)
router.delete('/:id', authMiddleware, deleteQuiz);

// @route   POST /api/quiz/delete-batch
// @desc    Bulk delete quizzes
// @access  Private (Requires JWT)
router.post('/delete-batch', authMiddleware, deleteQuizzesBatch);

// @route   PATCH /api/quiz/:id
// @desc    Update a quiz
// @access  Private (Requires JWT, must be the creator)
router.patch('/:id', authMiddleware, updateQuiz);

export default router;
