import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    confirmArrival,
    completeViewing,
    reportNoShow,
} from '../controllers/bookingWorkflowController';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Confirm arrival at viewing location
router.post('/:id/confirm-arrival', confirmArrival);

// Complete viewing with outcome
router.post('/:id/complete', completeViewing);

// Report no-show
router.post('/:id/report-no-show', reportNoShow);

export default router;
