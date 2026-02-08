"use client";

import React, { FC } from "react";
import NcModal from "@/shared/NcModal";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    children?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    confirmButtonClass?: string;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    children,
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    confirmButtonClass = "!bg-red-600 hover:!bg-red-700 text-white",
}) => {
    const renderContent = () => {
        return (
            <div className="space-y-6">
                <p className="text-neutral-600 dark:text-neutral-400">
                    {description}
                </p>
                {children && <div className="mt-4">{children}</div>}
                <div className="flex justify-end space-x-3">
                    <ButtonSecondary onClick={onClose}>{cancelText}</ButtonSecondary>
                    <ButtonPrimary
                        className={confirmButtonClass}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </ButtonPrimary>
                </div>
            </div>
        );
    };

    return (
        <NcModal
            isOpenProp={isOpen}
            onCloseModal={onClose}
            renderContent={renderContent}
            renderTrigger={() => null}
            modalTitle={title}
            contentExtraClass="max-w-md"
        />
    );
};

export default ConfirmationModal;
