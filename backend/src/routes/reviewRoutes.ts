import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, reviewController.submitReview);
router.get('/', authMiddleware, reviewController.getMyReviews);

export default router;
