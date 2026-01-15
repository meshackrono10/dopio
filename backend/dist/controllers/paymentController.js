"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStatus = exports.mpesaCallback = exports.initiateStkPush = void 0;
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
const initiateStkPush = async (req, res) => {
    try {
        const { invoiceId, phone } = req.body;
        const invoice = await index_1.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { request: true },
        });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        const token = await getMpesaToken();
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
        const response = await axios_1.default.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(invoice.amount),
            PartyA: phone,
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: phone,
            CallBackURL: process.env.MPESA_CALLBACK_URL,
            AccountReference: `INV-${invoice.id.slice(0, 8)}`,
            TransactionDesc: 'Viewing Fee Payment',
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // Here you would typically store the CheckoutRequestID to track the payment
        res.json(response.data);
    }
    catch (error) {
        console.error('M-Pesa Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to initiate M-Pesa payment' });
    }
};
exports.initiateStkPush = initiateStkPush;
const mpesaCallback = async (req, res) => {
    try {
        const { Body } = req.body;
        const { stkCallback } = Body;
        if (stkCallback.ResultCode === 0) {
            // Payment successful
            const checkoutRequestId = stkCallback.CheckoutRequestID;
            const amount = stkCallback.CallbackMetadata.Item.find((i) => i.Name === 'Amount').Value;
            const mpesaReceiptNumber = stkCallback.CallbackMetadata.Item.find((i) => i.Name === 'MpesaReceiptNumber').Value;
            // Update invoice status (you'd need to find the invoice by checkoutRequestId)
            // For now, this is a placeholder
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
    // Placeholder for checking payment status
    res.json({ status: 'PENDING' });
};
exports.getPaymentStatus = getPaymentStatus;
