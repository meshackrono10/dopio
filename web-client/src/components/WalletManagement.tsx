"use client";

import React, { useState } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";

interface WalletBalance {
    available: number;
    escrow: number;
    pending: number;
}

export default function WalletManagement() {
    const [balance, setBalance] = useState<WalletBalance>({
        available: 25000,
        escrow: 15000,
        pending: 5000,
    });

    const [showDeposit, setShowDeposit] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);

    // Deposit states
    const [depositAmount, setDepositAmount] = useState("");
    const [depositPhone, setDepositPhone] = useState("+254");
    const [depositProcessing, setDepositProcessing] = useState(false);

    // Withdrawal states
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawPhone, setWithdrawPhone] = useState("+254");
    const [withdrawProcessing, setWithdrawProcessing] = useState(false);

    const handleDeposit = () => {
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        if (depositPhone.length < 12) {
            alert("Please enter a valid phone number");
            return;
        }

        setDepositProcessing(true);

        // Simulate M-Pesa STK Push
        setTimeout(() => {
            const amount = parseFloat(depositAmount);
            setBalance(prev => ({
                ...prev,
                available: prev.available + amount,
            }));

            setDepositProcessing(false);
            setShowDeposit(false);
            setDepositAmount("");

            alert(`Successfully deposited KES ${amount.toLocaleString()} to your wallet!`);
        }, 3000);
    };

    const handleWithdraw = () => {
        const amount = parseFloat(withdrawAmount);

        if (!withdrawAmount || amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        if (amount > balance.available) {
            alert("Insufficient balance");
            return;
        }

        if (withdrawPhone.length < 12) {
            alert("Please enter a valid phone number");
            return;
        }

        setWithdrawProcessing(true);

        // Simulate withdrawal processing
        setTimeout(() => {
            setBalance(prev => ({
                ...prev,
                available: prev.available - amount,
            }));

            setWithdrawProcessing(false);
            setShowWithdraw(false);
            setWithdrawAmount("");

            alert(`Successfully withdrew KES ${amount.toLocaleString()} to ${withdrawPhone}`);
        }, 3000);
    };

    return (
        <div className="space-y-6">
            {/* Balance Overview */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Total Balance</h3>
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold">
                        KES {(balance.available + balance.escrow + balance.pending).toLocaleString()}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                    <div>
                        <p className="text-xs opacity-75 mb-1">Available</p>
                        <p className="font-semibold">KES {balance.available.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs opacity-75 mb-1">In Escrow</p>
                        <p className="font-semibold">KES {balance.escrow.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs opacity-75 mb-1">Pending</p>
                        <p className="font-semibold">KES {balance.pending.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setShowDeposit(true)}
                    className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                    <i className="las la-plus-circle text-3xl text-green-600 mb-2"></i>
                    <p className="font-semibold text-green-800 dark:text-green-300">Deposit Funds</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Add money to wallet</p>
                </button>

                <button
                    onClick={() => setShowWithdraw(true)}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                    <i className="las la-arrow-circle-down text-3xl text-blue-600 mb-2"></i>
                    <p className="font-semibold text-blue-800 dark:text-blue-300">Withdraw</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Transfer to M-Pesa</p>
                </button>
            </div>

            {/* Deposit Modal */}
            {showDeposit && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Deposit Funds</h3>
                            <button
                                onClick={() => setShowDeposit(false)}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                            >
                                <i className="las la-times text-xl"></i>
                            </button>
                        </div>

                        {depositProcessing ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="font-semibold mb-2">Processing Payment</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Check your phone for M-Pesa prompt...
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Amount (KES) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        M-Pesa Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={depositPhone}
                                        onChange={(e) => setDepositPhone(e.target.value)}
                                        placeholder="+254 712 345 678"
                                        className="w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                                    />
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                    <p className="text-sm text-green-800 dark:text-green-300">
                                        <i className="las la-info-circle mr-2"></i>
                                        You&apos;ll receive an M-Pesa prompt to complete the payment
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <ButtonSecondary
                                        onClick={() => setShowDeposit(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </ButtonSecondary>
                                    <ButtonPrimary
                                        onClick={handleDeposit}
                                        className="flex-1"
                                    >
                                        <i className="lab la-cc-mpesa mr-2"></i>
                                        Deposit
                                    </ButtonPrimary>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdraw && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Withdraw Funds</h3>
                            <button
                                onClick={() => setShowWithdraw(false)}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                            >
                                <i className="las la-times text-xl"></i>
                            </button>
                        </div>

                        {withdrawProcessing ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="font-semibold mb-2">Processing Withdrawal</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Please wait...
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                                        Available Balance
                                    </p>
                                    <p className="text-2xl font-bold">
                                        KES {balance.available.toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Amount to Withdraw (KES) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        max={balance.available}
                                        className="w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Max: KES {balance.available.toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        M-Pesa Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={withdrawPhone}
                                        onChange={(e) => setWithdrawPhone(e.target.value)}
                                        placeholder="+254 712 345 678"
                                        className="w-full border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-2xl text-sm font-normal h-11 px-4 py-3"
                                    />
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                        <i className="las la-exclamation-triangle mr-2"></i>
                                        Withdrawals may take 1-3 business days to process
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <ButtonSecondary
                                        onClick={() => setShowWithdraw(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </ButtonSecondary>
                                    <ButtonPrimary
                                        onClick={handleWithdraw}
                                        className="flex-1"
                                    >
                                        <i className="las la-paper-plane mr-2"></i>
                                        Withdraw
                                    </ButtonPrimary>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="font-bold">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {[
                        { type: "deposit", amount: 10000, date: "2024-12-22", status: "completed" },
                        { type: "withdrawal", amount: 5000, date: "2024-12-21", status: "completed" },
                        { type: "escrow_release", amount: 15000, date: "2024-12-20", status: "completed" },
                    ].map((tx, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "deposit"
                                    ? "bg-green-100 dark:bg-green-900/20"
                                    : tx.type === "withdrawal"
                                        ? "bg-blue-100 dark:bg-blue-900/20"
                                        : "bg-purple-100 dark:bg-purple-900/20"
                                    }`}>
                                    <i className={`las ${tx.type === "deposit"
                                        ? "la-arrow-down text-green-600"
                                        : tx.type === "withdrawal"
                                            ? "la-arrow-up text-blue-600"
                                            : "la-lock-open text-purple-600"
                                        } text-xl`}></i>
                                </div>
                                <div>
                                    <p className="font-semibold capitalize">
                                        {tx.type.replace("_", " ")}
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${tx.type === "deposit" || tx.type === "escrow_release"
                                    ? "text-green-600"
                                    : "text-red-600"
                                    }`}>
                                    {tx.type === "deposit" || tx.type === "escrow_release" ? "+" : "-"}
                                    KES {tx.amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {tx.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
