export interface User {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}
