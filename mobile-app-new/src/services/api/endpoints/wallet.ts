/**
 * Wallet API Endpoints
 */

import apiClient from '../client';
import { ENDPOINTS } from '../../../config/api.config';

export interface WalletBalance {
    available: number;
    escrow: number;
    pending: number;
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'earning';
    amount: number;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

export const walletApi = {
    /**
     * Get wallet balance
     */
    getBalance: async () => {
        return apiClient.get<WalletBalance>(ENDPOINTS.WALLET.BALANCE);
    },

    /**
     * Get transaction history
     */
    getTransactions: async (page = 1, limit = 20) => {
        return apiClient.get<Transaction[]>(
            ENDPOINTS.WALLET.TRANSACTIONS,
            { params: { page, limit } }
        );
    },

    /**
     * Withdraw funds
     */
    withdraw: async (amount: number, method: string, accountDetails: any) => {
        return apiClient.post(ENDPOINTS.WALLET.WITHDRAW, {
            amount,
            method,
            accountDetails,
        });
    },

    /**
     * Deposit funds
     */
    deposit: async (amount: number, method: string) => {
        return apiClient.post(ENDPOINTS.WALLET.DEPOSIT, {
            amount,
            method,
        });
    },
};
