"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const rescheduleController_1 = require("../controllers/rescheduleController");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.authMiddleware);
// Reschedule requests
router.post('/:id/reschedule', rescheduleController_1.createRescheduleRequest);
router.post('/:id/reschedule/:rescheduleId/respond', rescheduleController_1.respondToReschedule);
router.post('/:id/reschedule/:rescheduleId/accept-counter', rescheduleController_1.acceptCounterProposal);
// Meeting point
router.post('/:id/meeting-point', rescheduleController_1.updateMeetingPoint);
router.post('/:id/meeting-point/viewed', rescheduleController_1.markMeetingPointViewed);
exports.default = router;
