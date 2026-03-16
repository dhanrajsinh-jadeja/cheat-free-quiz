const API_BASE_URL = 'http://localhost:5000/api';

export interface UserStats {
    totalQuizzesTaken: number;
    averageScore: number;
    completedTopics: number;
    recentActivity: {
        id: string;
        quizId: string;
        title: string;
        category: string;
        score: number;
        totalMarks: number;
        percentage: number;
        date: string;
    }[];
    attemptHistory: {
        id: string;
        quizId: string;
        title: string;
        category: string;
        score: number;
        totalMarks: number;
        percentage: number;
        date: string;
    }[];
}

export const quizService = {
    /**
     * Get a specific quiz by ID
     */
    getQuiz: async (id: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/quiz/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch quiz');
        }

        return result;
    },

    /**
     * Create a new quiz
     */
    createQuiz: async (quizData: any): Promise<any> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(quizData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to create quiz');
        }

        return result;
    },

    /**
     * Publish a quiz
     */
    publishQuiz: async (id: string, startDate?: Date, endDate?: Date): Promise<any> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/${id}/publish`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ startDate, endDate })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to publish quiz');
        }

        return result;
    },

    /**
     * Get dashboard statistics for the logged-in user
     */
    getUserStats: async (): Promise<UserStats> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/stats/user`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch statistics');
        }

        return result;
    },

    /**
     * Get all quizzes created by the logged-in user
     */
    getMyQuizzes: async (): Promise<any[]> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/my/all`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch quizzes');
        }

        return result;
    },

    /**
     * Delete a quiz
     */
    deleteQuiz: async (id: string): Promise<any> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/${id}`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete quiz');
        }

        return result;
    },

    /**
     * Bulk delete quizzes
     */
    deleteQuizzesBatch: async (ids: string[]): Promise<any> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/delete-batch`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ids }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete quizzes');
        }

        return result;
    },

    /**
     * Update an existing quiz
     */
    updateQuiz: async (id: string, quizData: any): Promise<any> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/${id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(quizData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to update quiz');
        }

        return result;
    },

    /**
     * Get attempt status for a quiz
     */
    getAttemptStatus: async (id: string): Promise<{ attemptCount: number, maxAttempts: number, canAttempt: boolean }> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/${id}/attempt-status`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch attempt status');
        }

        return result;
    }
};
