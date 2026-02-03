import { Router } from 'express';
import * as viewingRequestController from '../controllers/viewingRequestController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Create new viewing request
router.post('/', authMiddleware, viewingRequestController.createRequest);

// Get all viewing requests (filtered by user role)
router.get('/', authMiddleware, viewingRequestController.getRequests);

// Get specific viewing request by ID
router.get('/:id', authMiddleware, viewingRequestController.getRequestById);

// Hunter actions on viewing requests
router.post('/:id/accept', authMiddleware, viewingRequestController.acceptViewingRequest);
router.post('/:id/reject', authMiddleware, viewingRequestController.rejectViewingRequest);
router.post('/:id/counter', authMiddleware, viewingRequestController.counterViewingRequest);

// Legacy status update endpoint (backward compatibility)
router.patch('/:id/status', authMiddleware, viewingRequestController.updateRequestStatus);

// Hide/Delete request for current user
router.delete('/:id', authMiddleware, viewingRequestController.hideRequest);

export default router;
