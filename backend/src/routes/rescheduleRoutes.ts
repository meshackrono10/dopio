import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    createRescheduleRequest,
    respondToReschedule,
    acceptCounterProposal,
    updateMeetingPoint,
    markMeetingPointViewed,
} from '../controllers/rescheduleController';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Reschedule requests
router.post('/:id/reschedule', createRescheduleRequest);
router.post('/:id/reschedule/:rescheduleId/respond', respondToReschedule);
router.post('/:id/reschedule/:rescheduleId/accept-counter', acceptCounterProposal);

// Meeting point
router.post('/:id/meeting-point', updateMeetingPoint);
router.post('/:id/meeting-point/viewed', markMeetingPointViewed);

export default router;
