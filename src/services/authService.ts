import { User } from '../types/user';

const API_BASE_URL = 'http://localhost:5000/api';

interface AuthResponse {
    token: string;
    user: User;
    message: string;
}

export const authService = {
    /**
     * Sign up a new user
     */
    signUp: async (data: any): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Signup failed');
        }

        // Store token in localStorage
        if (result.token) {
            localStorage.setItem('token', result.token);
        }

        return result;
    },

    /**
     * Login user
     */
    login: async (data: any): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Login failed');
        }

        if (result.token) {
            localStorage.setItem('token', result.token);
        }

        return result;
    },

    /**
     * Google Login
     */
    googleLogin: async (credential: string): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Google Login failed');
        }

        if (result.token) {
            localStorage.setItem('token', result.token);
        }

        return result;
    },

    /**
     * Logout user
     */
    logout: () => {
        localStorage.removeItem('token');
    },

    /**
     * Forgot Password
     */
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to send reset email');
        }

        return result;
    },

    /**
     * Reset Password
     */
    resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to reset password');
        }

        return result;
    },

    /**
     * Get current user profile
     */
    getProfile: async (): Promise<User> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch profile');
        }

        return result;
    }
};
