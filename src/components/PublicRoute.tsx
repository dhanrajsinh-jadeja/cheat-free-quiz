import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PublicRouteProps {
    children: React.ReactNode;
}

/**
 * PublicRoute component directs authenticated users away from public-only pages 
 * (like Login, Signup, Forgot Password) to their profile/dashboard.
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    if (token) {
        // Redirect authenticated users to the profile page
        // If they were trying to go somewhere else before being forced to login,
        // we could potentially use that here, but usually, we just go to profile.
        const from = (location.state as any)?.from?.pathname || '/profile';
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;
