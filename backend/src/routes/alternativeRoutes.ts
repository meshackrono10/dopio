import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    requestAlternative,
    offerAlternative,
    acceptAlternative,
    declineAlternative,
} from '../controllers/alternativeController';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Alternative property requests
router.post('/:id/request-alternative', requestAlternative);
router.post('/:id/offer-alternative', offerAlternative);
router.post('/:id/accept-alternative', acceptAlternative);
router.post('/:id/decline-alternative', declineAlternative);

export default router;
