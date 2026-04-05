import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware using the Double Submit Cookie pattern.
 * Compares the 'XSRF-TOKEN' cookie with the 'X-XSRF-TOKEN' header.
 * This pattern doesn't require a database but ensures the request 
 * originated from a trusted client that can read its own cookies.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Only enforce for state-changing methods
    const methodsToCheck = ['POST', 'PUT', 'PATCH', 'DELETE'];
    
    if (!methodsToCheck.includes(req.method)) {
        return next();
    }

    const cookies = (req as any).cookies || {};
    const csrfCookie = cookies['XSRF-TOKEN'];
    const csrfHeader = req.headers['x-xsrf-token'];

    // In double-submit pattern, the cookie and header value must match exactly
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        // Log potentially malicious activity if needed
        return res.status(403).json({ 
            message: 'Security validation failed: Invalid or missing CSRF token.' 
        });
    }

    next();
};

/**
 * Helper to generate a cryptographically strong random token
 */
export const generateCsrfToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};
