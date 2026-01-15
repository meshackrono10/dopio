import { Router } from 'express';
import * as searchRequestController from '../controllers/searchRequestController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Create new search request
router.post('/', authMiddleware, searchRequestController.createSearchRequest);

// Get all search requests
router.get('/', authMiddleware, searchRequestController.getSearchRequests);

// Submit bid (Hunter)
router.post('/:searchRequestId/bids', authMiddleware, searchRequestController.submitBid);

// Get bids for a search request
router.get('/:searchRequestId/bids', authMiddleware, searchRequestController.getBidsForRequest);

// Accept bid (Tenant)
router.post('/bids/:bidId/accept', authMiddleware, searchRequestController.acceptBid);

export default router;
