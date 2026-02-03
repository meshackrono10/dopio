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

// Tenant responds to meeting point
router.post('/:id/meeting-point/respond', authMiddleware, bookingController.respondToMeetingPoint);

// Confirm physical meeting (hunter escorts tenant)
router.post('/:id/confirm-meeting', authMiddleware, bookingController.confirmPhysicalMeeting);

// Tenant confirms viewing completed - RELEASES PAYMENT
router.post('/:id/complete', authMiddleware, bookingController.confirmViewingCompleted);

// Tenant submits viewing outcome (Done/Issue)
router.post('/:id/outcome', authMiddleware, bookingController.submitViewingOutcome);

// Request reschedule
router.post('/:id/reschedule', authMiddleware, bookingController.requestReschedule);

// Respond to reschedule request (accept/reject/counter)
router.post('/:id/reschedule/:rescheduleId/respond', authMiddleware, bookingController.respondToReschedule);

// Cancel booking
router.post('/:id/cancel', authMiddleware, bookingController.cancelBooking);

// Mark booking as done
router.post('/:id/done', authMiddleware, bookingController.markBookingDone);

// Cancel reported issue
router.post('/:id/cancel-issue', authMiddleware, bookingController.cancelIssue);

// Respond to issue
router.post('/:id/respond-issue', authMiddleware, bookingController.respondToIssue);

// Hide/Delete booking for current user
router.delete('/:id', authMiddleware, bookingController.hideBooking);

export default router;
