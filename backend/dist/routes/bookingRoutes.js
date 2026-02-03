"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController = __importStar(require("../controllers/bookingController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Get all bookings for logged-in user
router.get('/', authMiddleware_1.authMiddleware, bookingController.getAllBookings);
// Get active bookings
router.get('/active', authMiddleware_1.authMiddleware, bookingController.getActiveBookings);
// Get specific booking by ID
router.get('/:id', authMiddleware_1.authMiddleware, bookingController.getBookingById);
// Hunter shares meeting point
router.post('/:id/meeting-point', authMiddleware_1.authMiddleware, bookingController.shareMeetingPoint);
// Tenant responds to meeting point
router.post('/:id/meeting-point/respond', authMiddleware_1.authMiddleware, bookingController.respondToMeetingPoint);
// Confirm physical meeting (hunter escorts tenant)
router.post('/:id/confirm-meeting', authMiddleware_1.authMiddleware, bookingController.confirmPhysicalMeeting);
// Tenant confirms viewing completed - RELEASES PAYMENT
router.post('/:id/complete', authMiddleware_1.authMiddleware, bookingController.confirmViewingCompleted);
// Tenant submits viewing outcome (Done/Issue)
router.post('/:id/outcome', authMiddleware_1.authMiddleware, bookingController.submitViewingOutcome);
// Request reschedule
router.post('/:id/reschedule', authMiddleware_1.authMiddleware, bookingController.requestReschedule);
// Respond to reschedule request (accept/reject/counter)
router.post('/:id/reschedule/:rescheduleId/respond', authMiddleware_1.authMiddleware, bookingController.respondToReschedule);
// Cancel booking
router.post('/:id/cancel', authMiddleware_1.authMiddleware, bookingController.cancelBooking);
// Mark booking as done
router.post('/:id/done', authMiddleware_1.authMiddleware, bookingController.markBookingDone);
// Cancel reported issue
router.post('/:id/cancel-issue', authMiddleware_1.authMiddleware, bookingController.cancelIssue);
// Respond to issue
router.post('/:id/respond-issue', authMiddleware_1.authMiddleware, bookingController.respondToIssue);
// Hide/Delete booking for current user
router.delete('/:id', authMiddleware_1.authMiddleware, bookingController.hideBooking);
exports.default = router;
