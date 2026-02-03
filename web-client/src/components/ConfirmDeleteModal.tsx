"use client";

import React, { FC } from "react";
import NcModal from "@/shared/NcModal";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";

export interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    loading?: boolean;
}

const ConfirmDeleteModal: FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Listing",
    description = "Are you sure you want to delete this listing? This action cannot be undone.",
    loading = false,
}) => {
    const renderContent = () => {
        return (
            <div className="space-y-6">
                <p className="text-neutral-600 dark:text-neutral-400">
                    {description}
                </p>
                <div className="flex justify-end space-x-3">
                    <ButtonSecondary onClick={onClose}>Cancel</ButtonSecondary>
                    <ButtonPrimary
                        className="!bg-red-600 hover:!bg-red-700 text-white"
                        onClick={onConfirm}
                        loading={loading}
                    >
                        Delete
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
            modalTitle={title}
            contentExtraClass="max-w-md"
        />
    );
};

export default ConfirmDeleteModal;
