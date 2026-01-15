import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as adminApprovalController from '../controllers/adminApprovalController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Admin middleware to check if user is admin
const adminMiddleware = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
};

// Dashboard and user management
router.get('/stats', authMiddleware, adminMiddleware, adminController.getDashboardStats);
router.get('/users', authMiddleware, adminMiddleware, adminController.getUsers);
router.get('/hunters', authMiddleware, adminMiddleware, adminController.getHunters);
router.get('/tenants', authMiddleware, adminMiddleware, adminController.getTenants);
router.get('/properties', authMiddleware, adminMiddleware, adminController.getAllProperties);
router.patch('/hunters/:hunterId/verification', authMiddleware, adminMiddleware, adminController.updateHunterVerification);
router.patch('/users/:userId/status', authMiddleware, adminMiddleware, adminController.updateUserStatus);

// Hunter Approval Workflow
router.get('/hunters/pending', authMiddleware, adminMiddleware, adminApprovalController.getPendingHunters);
router.post('/hunters/:hunterId/approve', authMiddleware, adminMiddleware, adminApprovalController.approveHunter);
router.post('/hunters/:hunterId/reject', authMiddleware, adminMiddleware, adminApprovalController.rejectHunter);

// Property Approval Workflow
router.get('/properties/pending', authMiddleware, adminMiddleware, adminApprovalController.getPendingProperties);
router.post('/properties/:propertyId/approve', authMiddleware, adminMiddleware, adminApprovalController.approveProperty);
router.post('/properties/:propertyId/reject', authMiddleware, adminMiddleware, adminApprovalController.rejectProperty);

// Dispute Resolution
router.post('/disputes/:disputeId/resolve', authMiddleware, adminMiddleware, adminApprovalController.resolveDisputeWithEvidence);

export default router;
