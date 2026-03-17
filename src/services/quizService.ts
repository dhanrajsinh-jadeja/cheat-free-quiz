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
    async getQuiz(id: string): Promise<any> {
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
    async createQuiz(quizData: any): Promise<any> {
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
    async publishQuiz(id: string, startDate?: Date, endDate?: Date): Promise<any> {
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
    async getUserStats(): Promise<UserStats> {
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
    async getMyQuizzes(): Promise<any[]> {
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
    async deleteQuiz(id: string): Promise<any> {
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
    async deleteQuizzesBatch(ids: string[]): Promise<any> {
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
    async updateQuiz(id: string, quizData: any): Promise<any> {
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
     * Submit a quiz attempt
     */
    async submitQuiz(id: string, answers: any[], proctoringViolations: number, startTime: string): Promise<any> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/${id}/submit`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answers, proctoringViolations, startTime }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit quiz');
        }

        return result;
    },

    /**
     * Get attempt status for a quiz
     */
    async getAttemptStatus(id: string): Promise<{ attemptCount: number, maxAttempts: number, canAttempt: boolean }> {
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
    },

    /**
     * Get analytics for a specific quiz (Creator only)
     */
    async getQuizAnalytics(id: string): Promise<any> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/${id}/analytics`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error(`Server returned HTML instead of JSON. This usually means a 404 or routing error. Status: ${response.status}`);
            }
            const result = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            throw new Error(result.message || `Failed to fetch analytics (Status: ${response.status})`);
        }

        return response.json();
    },

    /**
     * Get detailed information for a specific attempt
     */
    async getAttemptDetails(attemptId: string): Promise<any> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/attempt/${attemptId}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch attempt details');
        }

        return result;
    },

    /**
     * Export quiz responses as CSV
     * The backend generates the full CSV string and sends it as a text/csv response.
     * The frontend receives it as a Blob and triggers a browser download.
     */
    async exportQuizResponses(id: string): Promise<{ blob: Blob; filename: string }> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/quiz/${id}/export`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            // Try to read the error message as text (handles both JSON and HTML responses)
            const errorText = await response.text().catch(() => '');
            let message = `Export failed with status ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                message = errorJson.message || message;
            } catch { /* response was plain text or HTML */ }
            throw new Error(message);
        }

        const blob = await response.blob();
        // Extract filename from Content-Disposition header if available
        const disposition = response.headers.get('content-disposition');
        let filename = 'quiz_responses.csv';
        if (disposition) {
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) filename = match[1].replace(/['"/]/g, '');
        }
        return { blob, filename };
    }
};
