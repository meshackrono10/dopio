"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const alternativeController_1 = require("../controllers/alternativeController");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.authMiddleware);
// Alternative property requests
router.post('/:id/request-alternative', alternativeController_1.requestAlternative);
router.post('/:id/offer-alternative', alternativeController_1.offerAlternative);
router.post('/:id/accept-alternative', alternativeController_1.acceptAlternative);
router.post('/:id/decline-alternative', alternativeController_1.declineAlternative);
exports.default = router;
