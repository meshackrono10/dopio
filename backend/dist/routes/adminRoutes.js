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
const adminController = __importStar(require("../controllers/adminController"));
const adminApprovalController = __importStar(require("../controllers/adminApprovalController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Admin middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
};
// Dashboard and user management
router.get('/stats', authMiddleware_1.authMiddleware, adminMiddleware, adminController.getDashboardStats);
router.get('/users', authMiddleware_1.authMiddleware, adminMiddleware, adminController.getUsers);
router.get('/hunters', authMiddleware_1.authMiddleware, adminMiddleware, adminController.getHunters);
router.get('/tenants', authMiddleware_1.authMiddleware, adminMiddleware, adminController.getTenants);
router.get('/properties', authMiddleware_1.authMiddleware, adminMiddleware, adminController.getAllProperties);
router.patch('/hunters/:hunterId/verification', authMiddleware_1.authMiddleware, adminMiddleware, adminController.updateHunterVerification);
router.patch('/users/:userId/status', authMiddleware_1.authMiddleware, adminMiddleware, adminController.updateUserStatus);
// Hunter Approval Workflow
router.get('/hunters/pending', authMiddleware_1.authMiddleware, adminMiddleware, adminApprovalController.getPendingHunters);
router.post('/hunters/:hunterId/approve', authMiddleware_1.authMiddleware, adminMiddleware, adminApprovalController.approveHunter);
router.post('/hunters/:hunterId/reject', authMiddleware_1.authMiddleware, adminMiddleware, adminApprovalController.rejectHunter);
// Property Approval Workflow
router.get('/properties/pending', authMiddleware_1.authMiddleware, adminMiddleware, adminApprovalController.getPendingProperties);
router.post('/properties/:propertyId/approve', authMiddleware_1.authMiddleware, adminMiddleware, adminApprovalController.approveProperty);
router.post('/properties/:propertyId/reject', authMiddleware_1.authMiddleware, adminMiddleware, adminApprovalController.rejectProperty);
// Dispute Resolution
router.get('/disputes', authMiddleware_1.authMiddleware, adminMiddleware, adminController.getDisputes);
router.post('/disputes/:disputeId/resolve', authMiddleware_1.authMiddleware, adminMiddleware, adminController.resolveDispute);
exports.default = router;
