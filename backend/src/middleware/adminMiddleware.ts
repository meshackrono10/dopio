import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};
