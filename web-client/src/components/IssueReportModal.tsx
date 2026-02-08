"use client";

import React, { FC, useState } from "react";
import NcModal from "@/shared/NcModal";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Textarea from "@/shared/Textarea";

export interface IssueReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (feedback: string) => void;
    loading?: boolean;
}

const IssueReportModal: FC<IssueReportModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
}) => {
    const [feedback, setFeedback] = useState("");

    const renderContent = () => {
        return (
            <div className="space-y-4">
                <p className="text-neutral-600 dark:text-neutral-400">
                    Please describe the issue with the viewing. Describe what went wrong or why you are reporting this.
                </p>
                <Textarea
                    placeholder="Describe the issue..."
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
                <div className="flex justify-end space-x-3">
                    <ButtonSecondary onClick={onClose}>Cancel</ButtonSecondary>
                    <ButtonPrimary
                        className="!bg-red-600 hover:!bg-red-700 text-white"
                        onClick={() => onConfirm(feedback)}
                        disabled={!feedback.trim()}
                        loading={loading}
                    >
                        Report Issue
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
            modalTitle="Report Viewing Issue"
            contentExtraClass="max-w-md"
        />
    );
};

export default IssueReportModal;
