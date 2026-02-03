"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useToast } from "@/components/Toast";

interface Transaction {
    id: string;
    type: "earning" | "withdrawal" | "refund";
    amount: number;
    description: string;
    status: "pending" | "completed" | "failed";
    createdAt: string;
    bookingId?: string;
}

interface WalletBalance {
    available: number;
    escrow: number;
    withdrawn: number;
}

export default function WalletPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [balance, setBalance] = useState<WalletBalance>({ available: 0, escrow: 0, withdrawn: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const [balanceRes, transactionsRes] = await Promise.all([
                api.get("/payments/summary"),
                api.get("/payments/transactions")
            ]);
            setBalance(balanceRes.data.balance);
            setTransactions(transactionsRes.data);
        } catch (error) {
            console.error("Failed to fetch wallet data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0 || amount > balance.available) {
            showToast("error", "Invalid withdrawal amount");
            return;
        }

        setIsWithdrawing(true);
        try {
            await api.post("/payments/withdraw", { amount });
            showToast("success", "Withdrawal request submitted");
            setShowWithdrawModal(false);
            setWithdrawAmount("");
            fetchWalletData();
        } catch (error) {
            showToast("error", "Failed to process withdrawal");
        } finally {
            setIsWithdrawing(false);
        }
    };

    const totalEarnings = balance.available + balance.withdrawn;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Wallet</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                    Manage your earnings and withdrawals
                </p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Available Balance</p>
                    <p className="text-3xl font-bold mt-2">KSh {balance.available.toLocaleString()}</p>
                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="mt-4 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-neutral-100 transition-colors text-sm font-medium"
                        disabled={balance.available <= 0}
                    >
                        Withdraw
                    </button>
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Pending (Escrow)</p>
                            <p className="text-3xl font-bold mt-2">KSh {balance.escrow.toLocaleString()}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                                Released after viewing completion
                            </p>
                        </div>
                        <i className="las la-clock text-4xl text-orange-500"></i>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Earnings</p>
                            <p className="text-3xl font-bold mt-2">KSh {totalEarnings.toLocaleString()}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                                Withdrawn: KSh {balance.withdrawn.toLocaleString()}
                            </p>
                        </div>
                        <i className="las la-chart-line text-4xl text-green-500"></i>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-xl font-semibold">Transaction History</h2>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <i className="las la-receipt text-6xl text-neutral-300 dark:text-neutral-600"></i>
                        <h3 className="text-xl font-semibold mt-4">No transactions yet</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                            Your transaction history will appear here
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "earning" ? "bg-green-100 dark:bg-green-900/30" :
                                                transaction.type === "withdrawal" ? "bg-blue-100 dark:bg-blue-900/30" :
                                                    "bg-orange-100 dark:bg-orange-900/30"
                                            }`}>
                                            <i className={`las ${transaction.type === "earning" ? "la-arrow-down text-green-600" :
                                                    transaction.type === "withdrawal" ? "la-arrow-up text-blue-600" :
                                                        "la-undo text-orange-600"
                                                } text-xl`}></i>
                                        </div>
                                        <div>
                                            <h3 className="font-medium capitalize">{transaction.type}</h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {transaction.description}
                                            </p>
                                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                                {new Date(transaction.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-semibold ${transaction.type === "earning" ? "text-green-600" :
                                                transaction.type === "withdrawal" ? "text-blue-600" :
                                                    "text-orange-600"
                                            }`}>
                                            {transaction.type === "withdrawal" ? "-" : "+"}KSh {transaction.amount.toLocaleString()}
                                        </p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${transaction.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                transaction.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            }`}>
                                            {transaction.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Withdraw Funds</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            Available balance: <span className="font-semibold">KSh {balance.available.toLocaleString()}</span>
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Amount (KSh)</label>
                            <input
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-900"
                                max={balance.available}
                                min={0}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowWithdrawModal(false);
                                    setWithdrawAmount("");
                                }}
                                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                                disabled={isWithdrawing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdraw}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                disabled={isWithdrawing}
                            >
                                {isWithdrawing ? "Processing..." : "Withdraw"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
