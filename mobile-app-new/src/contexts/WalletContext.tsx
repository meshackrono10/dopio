import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionType = 'deposit' | 'withdrawal' | 'earning' | 'payment' | 'refund' | 'commission';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    description: string;
    mpesaRef?: string;
    createdAt: string;
    completedAt?: string;
}

export interface PayoutSettings {
    mpesaNumber: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    preferredMethod: 'mpesa' | 'bank';
}

interface WalletContextType {
    balance: number;
    pendingBalance: number;
    transactions: Transaction[];
    payoutSettings: PayoutSettings | null;
    deposit: (amount: number, mpesaNumber: string) => Promise<boolean>;
    withdraw: (amount: number) => Promise<boolean>;
    addEarning: (amount: number, description: string) => void;
    addPayment: (amount: number, description: string) => void;
    updatePayoutSettings: (settings: PayoutSettings) => Promise<void>;
    getTransactionById: (id: string) => Transaction | undefined;
    refreshWallet: () => Promise<void>;
    refreshTransactions: () => Promise<void>;

    // New: Escrow management
    releaseEscrow: (bookingId: string, amount: number, hunterId: string) => Promise<void>;
    refundEscrow: (bookingId: string, amount: number, tenantId: string, reason: string) => Promise<void>;

    loading: boolean;
    error: string | null;
    clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY_BALANCE = 'dapio_wallet_balance';
const STORAGE_KEY_TRANSACTIONS = 'dapio_wallet_transactions';
const STORAGE_KEY_PAYOUT = 'dapio_payout_settings';

// Mock initial transactions
const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'txn-1',
        type: 'earning',
        amount: 2125,
        status: 'completed',
        description: 'Gold Package Viewing - Modern 2BR Kasarani',
        createdAt: '2024-12-10T10:00:00Z',
        completedAt: '2024-12-10T10:05:00Z',
    },
    {
        id: 'txn-2',
        type: 'earning',
        amount: 850,
        status: 'completed',
        description: 'Bronze Package Viewing - Bedsitter Roysambu',
        createdAt: '2024-12-05T14:30:00Z',
        completedAt: '2024-12-05T14:35:00Z',
    },
    {
        id: 'txn-3',
        type: 'withdrawal',
        amount: 2000,
        status: 'completed',
        description: 'Withdrawal to M-Pesa',
        mpesaRef: 'RK12345678',
        createdAt: '2024-12-01T09:00:00Z',
        completedAt: '2024-12-01T09:02:00Z',
    },
];

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [balance, setBalance] = useState(0);
    const [pendingBalance, setPendingBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
    const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    useEffect(() => {
        loadWalletData();
    }, []);

    useEffect(() => {
        saveWalletData();
    }, [balance, transactions, payoutSettings]);

    const loadWalletData = async () => {
        try {
            const [storedBalance, storedTransactions, storedPayout] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEY_BALANCE),
                AsyncStorage.getItem(STORAGE_KEY_TRANSACTIONS),
                AsyncStorage.getItem(STORAGE_KEY_PAYOUT),
            ]);

            if (storedBalance) setBalance(parseFloat(storedBalance));
            if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
            if (storedPayout) setPayoutSettings(JSON.parse(storedPayout));
        } catch (error) {
            console.error('Failed to load wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveWalletData = async () => {
        try {
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEY_BALANCE, balance.toString()),
                AsyncStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions)),
                payoutSettings
                    ? AsyncStorage.setItem(STORAGE_KEY_PAYOUT, JSON.stringify(payoutSettings))
                    : AsyncStorage.removeItem(STORAGE_KEY_PAYOUT),
            ]);
        } catch (error) {
            console.error('Failed to save wallet data:', error);
        }
    };

    const deposit = async (amount: number, mpesaNumber: string): Promise<boolean> => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const transaction: Transaction = {
            id: `txn-${Date.now()}`,
            type: 'deposit',
            amount,
            status: 'completed',
            description: `Deposit from ${mpesaNumber}`,
            mpesaRef: `DEP${Math.random().toString(36).substring(7).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
        };

        setTransactions([transaction, ...transactions]);
        setBalance(balance + amount);
        return true;
    };

    const withdraw = async (amount: number): Promise<boolean> => {
        if (amount > balance) {
            return false; // Insufficient balance
        }

        if (!payoutSettings || !payoutSettings.mpesaNumber) {
            return false; // No payout method set
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const transaction: Transaction = {
            id: `txn-${Date.now()}`,
            type: 'withdrawal',
            amount,
            status: 'completed',
            description: `Withdrawal to M-Pesa ${payoutSettings.mpesaNumber}`,
            mpesaRef: `WD${Math.random().toString(36).substring(7).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
        };

        setTransactions([transaction, ...transactions]);
        setBalance(balance - amount);
        return true;
    };

    const addEarning = (amount: number, description: string) => {
        const transaction: Transaction = {
            id: `txn-${Date.now()}`,
            type: 'earning',
            amount,
            status: 'completed',
            description,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
        };

        setTransactions([transaction, ...transactions]);
        setBalance(balance + amount);
    };

    const addPayment = (amount: number, description: string) => {
        const transaction: Transaction = {
            id: `txn-${Date.now()}`,
            type: 'payment',
            amount,
            status: 'completed',
            description,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
        };

        setTransactions([transaction, ...transactions]);
        setBalance(balance - amount);
    };

    const updatePayoutSettings = async (settings: PayoutSettings) => {
        setPayoutSettings(settings);
    };

    const getTransactionById = (id: string) => {
        return transactions.find(t => t.id === id);
    };

    const refreshWallet = async () => {
        try {
            clearError();
            setLoading(true);
            // Simulate API call to refresh balance
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In real app, fetch fresh balance from API
            await loadWalletData();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to refresh wallet';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const releaseEscrow = async (
        bookingId: string,
        amount: number,
        hunterId: string
    ): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const transaction: Transaction = {
                id: `txn-${Date.now()}`,
                type: 'earning',
                amount,
                status: 'completed',
                description: `Escrow released for booking ${bookingId}`,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
            };

            setTransactions([transaction, ...transactions]);
            setBalance(balance + amount);

            // In real implementation:
            // - Update booking status to 'completed'
            // - Send notification to hunter about payment received
            // - Update hunter's earnings
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to release escrow';
            setError(errorMessage);
            throw err;
        }
    };

    const refundEscrow = async (
        bookingId: string,
        amount: number,
        tenantId: string,
        reason: string
    ): Promise<void> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const transaction: Transaction = {
                id: `txn-${Date.now()}`,
                type: 'refund',
                amount,
                status: 'completed',
                description: `Refund for booking ${bookingId} - ${reason}`,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
            };

            setTransactions([transaction, ...transactions]);
            setBalance(balance + amount);

            // In real implementation:
            // - Update booking status to 'refunded'
            // - Flag hunter (if property mismatch verified)
            // - Send notifications to both parties
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to process refund';
            setError(errorMessage);
            throw err;
        }
    };

    const refreshTransactions = async () => {
        try {
            clearError();
            // Simulate API call to fetch fresh transactions
            await new Promise(resolve => setTimeout(resolve, 800));

            // In real app, fetch from API
            // For now, just reload from storage
            const storedTransactions = await AsyncStorage.getItem(STORAGE_KEY_TRANSACTIONS);
            if (storedTransactions) {
                setTransactions(JSON.parse(storedTransactions));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to refresh transactions';
            setError(errorMessage);
        }
    };

    return (
        <WalletContext.Provider
            value={{
                balance,
                pendingBalance,
                transactions,
                payoutSettings,
                deposit,
                withdraw,
                addEarning,
                addPayment,
                updatePayoutSettings,
                getTransactionById,
                refreshWallet,
                refreshTransactions,
                releaseEscrow,
                refundEscrow,
                loading,
                error,
                clearError,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
}
