"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestWithdrawal = exports.getHunterEarnings = exports.getPaymentHistory = exports.getPaymentStatus = exports.mpesaCallback = exports.initiateStkPushReal = exports.initiateStkPush = void 0;
const axios_1 = __importDefault(require("axios"));
const index_1 = require("../index");
const getMpesaToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await axios_1.default.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });
    return response.data.access_token;
};
// SIMULATED PAYMENT - Follows the blueprint: Payment goes to ESCROW, awaiting Hunter acceptance
const initiateStkPush = async (req, res) => {
    try {
        const { requestId, phone } = req.body;
        const request = await index_1.prisma.viewingRequest.findUnique({
            where: { id: requestId },
            include: {
                property: {
                    include: {
                        hunter: true
                    }
                },
                tenant: true
            }
        });
        if (!request) {
            return res.status(404).json({ message: 'Viewing request not found' });
        }
        // SIMULATE PAYMENT SUCCESS IMMEDIATELY
        const mpesaReceiptNumber = `SIM${Date.now().toString().slice(-8)}`;
        console.log('[Payment] Payment successful, moving funds to ESCROW');
        // Update request status to ESCROW (funds held until hunter accepts)
        await index_1.prisma.viewingRequest.update({
            where: { id: requestId },
            data: { paymentStatus: 'ESCROW' }
        });
        // Create payment record
        await index_1.prisma.paymentHistory.create({
            data: {
                userId: request.tenantId,
                amount: request.amount || 0,
                type: 'BOOKING_PAYMENT',
                mpesaReceiptNumber: mpesaReceiptNumber,
                phoneNumber: phone,
                status: 'COMPLETED',
                description: `Viewing fee for ${request.property.title}`,
                metadata: JSON.stringify({
                    propertyId: request.propertyId,
                    viewingRequestId: request.id,
                }),
            }
        });
        console.log('[Payment] Payment recorded. Funds in ESCROW, awaiting Hunter acceptance.');
        // NOTE: Booking is NOT created here!
        // According to blueprint: Hunter must ACCEPT the viewing request first
        // Only then is a booking created with the agreed date/time
        res.json({
            success: true,
            message: 'Payment successful! Viewing request sent to House Hunter.',
            mpesaReceiptNumber,
            viewingRequestId: request.id,
            amount: request.amount,
            status: 'ESCROW',
            MerchantRequestID: `SIMULATED-${Date.now()}`,
            CheckoutRequestID: `SIMULATED-${requestId}`,
            ResponseCode: '0',
            ResponseDescription: 'Success. Payment simulated.',
            CustomerMessage: 'Payment successful! Awaiting House Hunter confirmation.'
        });
    }
    catch (error) {
        console.error('Simulated Payment Error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Failed to process simulated payment', error: error.message });
    }
};
exports.initiateStkPush = initiateStkPush;
// Real M-Pesa implementation (commented out for future use)
const initiateStkPushReal = async (req, res) => {
    try {
        const { requestId, phone } = req.body;
        const request = await index_1.prisma.viewingRequest.findUnique({
            where: { id: requestId },
        });
        if (!request) {
            return res.status(404).json({ message: 'Viewing request not found' });
        }
        const token = await getMpesaToken();
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
        const response = await axios_1.default.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(request.amount || 0),
            PartyA: phone,
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: phone,
            CallBackURL: process.env.MPESA_CALLBACK_URL,
            AccountReference: `REQ-${request.id.slice(0, 8)}`,
            TransactionDesc: 'Viewing Fee Payment',
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('M-Pesa Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to initiate M-Pesa payment' });
    }
};
exports.initiateStkPushReal = initiateStkPushReal;
const mpesaCallback = async (req, res) => {
    try {
        const { Body } = req.body;
        const { stkCallback } = Body;
        if (stkCallback.ResultCode === 0) {
            const amount = stkCallback.CallbackMetadata.Item.find((i) => i.Name === 'Amount').Value;
            const mpesaReceiptNumber = stkCallback.CallbackMetadata.Item.find((i) => i.Name === 'MpesaReceiptNumber').Value;
            console.log(`Payment successful: ${mpesaReceiptNumber} for ${amount}`);
        }
        else {
            console.log(`Payment failed: ${stkCallback.ResultDesc}`);
        }
        res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    catch (error) {
        console.error('Callback Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.mpesaCallback = mpesaCallback;
const getPaymentStatus = async (req, res) => {
    res.json({ status: 'PENDING' });
};
exports.getPaymentStatus = getPaymentStatus;
// Get payment history for a user
const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const payments = await index_1.prisma.paymentHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(payments);
    }
    catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ message: 'Failed to get payment history' });
    }
};
exports.getPaymentHistory = getPaymentHistory;
// Get hunter earnings (for withdrawal)
const getHunterEarnings = async (req, res) => {
    try {
        const hunterId = req.user.userId;
        const earnings = await index_1.prisma.hunterEarnings.findMany({
            where: { hunterId },
            include: {
                booking: {
                    include: {
                        property: true,
                        tenant: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        const totalPending = earnings
            .filter((e) => e.status === 'PENDING')
            .reduce((sum, e) => sum + e.amount, 0);
        const totalWithdrawn = earnings
            .filter((e) => e.status === 'WITHDRAWN')
            .reduce((sum, e) => sum + e.amount, 0);
        res.json({
            earnings,
            totalPending,
            totalWithdrawn,
            totalEarnings: totalPending + totalWithdrawn,
        });
    }
    catch (error) {
        console.error('Get hunter earnings error:', error);
        res.status(500).json({ message: 'Failed to get earnings' });
    }
};
exports.getHunterEarnings = getHunterEarnings;
// Request withdrawal (hunter)
const requestWithdrawal = async (req, res) => {
    try {
        const hunterId = req.user.userId;
        const { amount, phoneNumber } = req.body;
        const pendingEarnings = await index_1.prisma.hunterEarnings.findMany({
            where: {
                hunterId,
                status: 'PENDING',
            }
        });
        const totalPending = pendingEarnings.reduce((sum, e) => sum + e.amount, 0);
        if (totalPending < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        let remaining = amount;
        for (const earning of pendingEarnings) {
            if (remaining <= 0)
                break;
            if (earning.amount <= remaining) {
                await index_1.prisma.hunterEarnings.update({
                    where: { id: earning.id },
                    data: { status: 'WITHDRAWN' }
                });
                remaining -= earning.amount;
            }
        }
        const withdrawal = await index_1.prisma.paymentHistory.create({
            data: {
                userId: hunterId,
                amount: amount,
                type: 'WITHDRAWAL',
                mpesaReceiptNumber: `WD${Date.now().toString().slice(-8)}`,
                phoneNumber: phoneNumber,
                status: 'COMPLETED',
                description: 'Hunter earnings withdrawal',
            }
        });
        res.json({
            success: true,
            message: 'Withdrawal completed successfully',
            withdrawal,
        });
    }
    catch (error) {
        console.error('Withdrawal error:', error);
        res.status(500).json({ message: 'Failed to process withdrawal' });
    }
};
exports.requestWithdrawal = requestWithdrawal;
