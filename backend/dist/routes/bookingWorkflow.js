"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const bookingWorkflowController_1 = require("../controllers/bookingWorkflowController");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.authMiddleware);
// Confirm arrival at viewing location
router.post('/:id/confirm-arrival', bookingWorkflowController_1.confirmArrival);
// Complete viewing with outcome
router.post('/:id/complete', bookingWorkflowController_1.completeViewing);
// Report no-show
router.post('/:id/report-no-show', bookingWorkflowController_1.reportNoShow);
exports.default = router;
