import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Get all bookings for logged-in user
router.get('/', authMiddleware, bookingController.getAllBookings);

// Get active bookings
router.get('/active', authMiddleware, bookingController.getActiveBookings);

// Get specific booking by ID
router.get('/:id', authMiddleware, bookingController.getBookingById);

// Hunter shares meeting point
router.post('/:id/meeting-point', authMiddleware, bookingController.shareMeetingPoint);

// Confirm physical meeting (hunter escorts tenant)
router.post('/:id/confirm-meeting', authMiddleware, bookingController.confirmPhysicalMeeting);

// Tenant confirms viewing completed - RELEASES PAYMENT
router.post('/:id/complete', authMiddleware, bookingController.confirmViewingCompleted);

// Request reschedule
router.post('/:id/reschedule', authMiddleware, bookingController.requestReschedule);

// Respond to reschedule request (accept/reject/counter)
router.post('/:id/reschedule/:rescheduleId/respond', authMiddleware, bookingController.respondToReschedule);

export default router;
