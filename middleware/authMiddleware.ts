import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-123';

// Extend the standard Express Request object to include our custom 'user' property.
// This allows downstream route handlers to access the logged-in user's ID and email.
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

/**
 * Authentication Middleware
 * Intercepts incoming requests to protected routes, extracts the JWT from the Authorization header,
 * verifies it, and attaches the decoded user payload to the request object.
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 🛡️ Prioritize the secure HttpOnly cookie over the Authorization header
    let token = (req as any).cookies?.['jwt'];
    
    if (!token) {
        token = req.header('Authorization')?.replace('Bearer ', '');
    }

    // If no token is provided, reject the request
    if (!token) {
        return res.status(401).json({ message: 'Authentication required: session not found or expired' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
        // Attach the decoded user data payload to the req object
        req.user = decoded;
        // Pass control to the next middleware or the actual route handler
        next();
    } catch (err) {
        // If the token is expired, tampered with, or invalid, reject the request
        res.status(401).json({ message: 'Token is not valid' });
    }
};
