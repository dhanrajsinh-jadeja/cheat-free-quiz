import { Quiz } from '../types/quiz';

const API_URL = 'http://localhost:5000/api/quiz';

class QuizService {
    private getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async createQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(quizData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create quiz');
        }

        return response.json();
    }

    async getQuiz(id: string): Promise<Quiz> {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch quiz');
        }

        return response.json();
    }

    async publishQuiz(id: string): Promise<{ message: string; quizLink: string; expiresAt: string }> {
        const response = await fetch(`${API_URL}/${id}/publish`, {
            method: 'POST',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to publish quiz');
        }

        return response.json();
    }

    async getMyQuizzes(): Promise<Quiz[]> {
        const response = await fetch(`${API_URL}/my/all`, {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch your quizzes');
        }

        return response.json();
    }
}

export const quizService = new QuizService();
