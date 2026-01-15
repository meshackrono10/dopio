import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../index';

const getMpesaToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        }
    );

    return response.data.access_token;
};

// SIMULATED PAYMENT - Follows the blueprint: Payment goes to ESCROW, awaiting Hunter acceptance
export const initiateStkPush = async (req: any, res: Response) => {
    try {
        const { invoiceId, phone } = req.body;
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                request: {
                    include: {
                        property: {
                            include: {
                                hunter: true
                            }
                        },
                        tenant: true
                    }
                }
            },
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // SIMULATE PAYMENT SUCCESS IMMEDIATELY
        const mpesaReceiptNumber = `SIM${Date.now().toString().slice(-8)}`;

        console.log('[Payment] Payment successful, moving funds to ESCROW');

        // Update invoice status to ESCROW (funds held until hunter accepts)
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'ESCROW' }
        });

        // Create payment record
        await prisma.paymentHistory.create({
            data: {
                userId: invoice.request.tenantId,
                amount: invoice.amount,
                type: 'BOOKING_PAYMENT',
                mpesaReceiptNumber: mpesaReceiptNumber,
                phoneNumber: phone,
                status: 'COMPLETED',
                description: `Viewing fee for ${invoice.request.property.title}`,
                metadata: {
                    invoiceId: invoice.id,
                    propertyId: invoice.request.propertyId,
                    viewingRequestId: invoice.requestId,
                },
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
            invoiceId: invoice.id,
            viewingRequestId: invoice.requestId,
            amount: invoice.amount,
            status: 'ESCROW',
            MerchantRequestID: `SIMULATED-${Date.now()}`,
            CheckoutRequestID: `SIMULATED-${invoiceId}`,
            ResponseCode: '0',
            ResponseDescription: 'Success. Payment simulated.',
            CustomerMessage: 'Payment successful! Awaiting House Hunter confirmation.'
        });
    } catch (error: any) {
        console.error('Simulated Payment Error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Failed to process simulated payment', error: error.message });
    }
};

// Real M-Pesa implementation (commented out for future use)
export const initiateStkPushReal = async (req: any, res: Response) => {
    try {
        const { invoiceId, phone } = req.body;
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { request: true },
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const token = await getMpesaToken();
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        const password = Buffer.from(
            `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
        ).toString('base64');

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
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
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        res.json(response.data);
    } catch (error: any) {
        console.error('M-Pesa Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to initiate M-Pesa payment' });
    }
};

export const mpesaCallback = async (req: Request, res: Response) => {
    try {
        const { Body } = req.body;
        const { stkCallback } = Body;

        if (stkCallback.ResultCode === 0) {
            const amount = stkCallback.CallbackMetadata.Item.find((i: any) => i.Name === 'Amount').Value;
            const mpesaReceiptNumber = stkCallback.CallbackMetadata.Item.find((i: any) => i.Name === 'MpesaReceiptNumber').Value;
            console.log(`Payment successful: ${mpesaReceiptNumber} for ${amount}`);
        } else {
            console.log(`Payment failed: ${stkCallback.ResultDesc}`);
        }

        res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (error: any) {
        console.error('Callback Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
    res.json({ status: 'PENDING' });
};

// Get payment history for a user
export const getPaymentHistory = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const payments = await prisma.paymentHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(payments);
    } catch (error: any) {
        console.error('Get payment history error:', error);
        res.status(500).json({ message: 'Failed to get payment history' });
    }
};

// Get hunter earnings (for withdrawal)
export const getHunterEarnings = async (req: any, res: Response) => {
    try {
        const hunterId = req.user.userId;
        const earnings = await prisma.hunterEarnings.findMany({
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
            .filter((e: any) => e.status === 'PENDING')
            .reduce((sum: number, e: any) => sum + e.amount, 0);

        const totalWithdrawn = earnings
            .filter((e: any) => e.status === 'WITHDRAWN')
            .reduce((sum: number, e: any) => sum + e.amount, 0);

        res.json({
            earnings,
            totalPending,
            totalWithdrawn,
            totalEarnings: totalPending + totalWithdrawn,
        });
    } catch (error: any) {
        console.error('Get hunter earnings error:', error);
        res.status(500).json({ message: 'Failed to get earnings' });
    }
};

// Request withdrawal (hunter)
export const requestWithdrawal = async (req: any, res: Response) => {
    try {
        const hunterId = req.user.userId;
        const { amount, phoneNumber } = req.body;

        const pendingEarnings = await prisma.hunterEarnings.findMany({
            where: {
                hunterId,
                status: 'PENDING',
            }
        });

        const totalPending = pendingEarnings.reduce((sum: number, e: any) => sum + e.amount, 0);

        if (totalPending < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        let remaining = amount;
        for (const earning of pendingEarnings) {
            if (remaining <= 0) break;

            if (earning.amount <= remaining) {
                await prisma.hunterEarnings.update({
                    where: { id: earning.id },
                    data: { status: 'WITHDRAWN' }
                });
                remaining -= earning.amount;
            }
        }

        const withdrawal = await prisma.paymentHistory.create({
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
    } catch (error: any) {
        console.error('Withdrawal error:', error);
        res.status(500).json({ message: 'Failed to process withdrawal' });
    }
};
