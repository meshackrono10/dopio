"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/ButtonPrimary";
import api from "@/services/api";
import { toast } from "react-toastify";

type Step = 1 | 2 | 3 | 4;

interface UploadedImages {
    idFront: File | null;
    idBack: File | null;
    selfie: File | null;
}

interface PreviewUrls {
    idFront: string | null;
    idBack: string | null;
    selfie: string | null;
}

export default function HaunterOnboarding() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [uploading, setUploading] = useState(false);

    const [images, setImages] = useState<UploadedImages>({
        idFront: null,
        idBack: null,
        selfie: null,
    });

    const [previews, setPreviews] = useState<PreviewUrls>({
        idFront: null,
        idBack: null,
        selfie: null,
    });

    React.useEffect(() => {
        if (!isAuthenticated || user?.role !== "HUNTER") {
            router.push("/");
        }
    }, [isAuthenticated, user, router]);

    const handleFileSelect = (type: keyof UploadedImages, file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setImages((prev) => ({ ...prev, [type]: file }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews((prev) => ({ ...prev, [type]: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleNext = () => {
        if (currentStep === 1 && !images.idFront) {
            toast.warning("Please upload the front of your ID");
            return;
        }
        if (currentStep === 2 && !images.idBack) {
            toast.warning("Please upload the back of your ID");
            return;
        }
        if (currentStep === 3 && !images.selfie) {
            toast.warning("Please upload a selfie photo");
            return;
        }

        if (currentStep < 4) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const handleSubmit = async () => {
        if (!images.idFront || !images.idBack || !images.selfie) {
            toast.error("Please complete all steps");
            return;
        }

        setUploading(true);
        try {
            // Upload ID Front
            const formDataFront = new FormData();
            formDataFront.append("images", images.idFront);
            const frontResponse = await api.post("/upload/multiple", formDataFront, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Front response:", frontResponse.data);

            // Upload ID Back
            const formDataBack = new FormData();
            formDataBack.append("images", images.idBack);
            const backResponse = await api.post("/upload/multiple", formDataBack, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Back response:", backResponse.data);

            // Upload Selfie
            const formDataSelfie = new FormData();
            formDataSelfie.append("images", images.selfie);
            const selfieResponse = await api.post("/upload/multiple", formDataSelfie, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Selfie response:", selfieResponse.data);

            // Extract URLs from response (backend returns array directly)
            const idFrontUrl = frontResponse.data[0]?.url;
            const idBackUrl = backResponse.data[0]?.url;
            const selfieUrl = selfieResponse.data[0]?.url;

            if (!idFrontUrl || !idBackUrl || !selfieUrl) {
                throw new Error("Failed to get upload URLs");
            }

            console.log("Uploading to profile:", { idFrontUrl, idBackUrl, selfieUrl });

            // Update user profile with all documents
            await api.patch("/users/profile", {
                idFrontUrl,
                idBackUrl,
                selfieUrl,
                verificationStatus: "PENDING",
            });

            toast.success("Verification documents submitted successfully! We'll review within 24-48 hours.");
            router.push("/haunter-dashboard");
        } catch (error: any) {
            console.error("Upload failed:", error);
            console.error("Error response:", error.response);
            console.error("Error data:", error.response?.data);
            toast.error(error.response?.data?.message || error.message || "Failed to upload. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (!user) return null;

    if (user.verificationStatus === "APPROVED") {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center">
                    <i className="las la-check-circle text-7xl text-green-600 mb-4"></i>
                    <h1 className="text-2xl font-bold mb-2">Verified Account</h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        Your account has been verified. You can now add listings and access all hunter features.
                    </p>
                    <ButtonPrimary href="/haunter-dashboard">Go to Dashboard</ButtonPrimary>
                </div>
            </div>
        );
    }

    if (user.verificationStatus === "PENDING") {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <i className="las la-clock text-7xl text-orange-600 mb-4"></i>
                    <h1 className="text-2xl font-bold mb-2">Verification In Progress</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                        Your documents are being reviewed
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        Thank you for submitting your verification documents. Our team is reviewing them and you
                        should hear back within 24-48 hours.
                    </p>
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-orange-900 dark:text-orange-100">
                            <i className="las la-info-circle mr-1"></i>
                            Estimated review time: 24-48 hours
                        </p>
                    </div>
                    <ButtonPrimary href="/haunter-dashboard">Back to Dashboard</ButtonPrimary>
                </div>
            </div>
        );
    }

    const stepConfig = [
        {
            step: 1,
            title: "ID Front",
            description: "Upload the front side of your government-issued ID",
            icon: "las la-id-card",
            type: "idFront" as keyof UploadedImages,
        },
        {
            step: 2,
            title: "ID Back",
            description: "Upload the back side of your ID",
            icon: "las la-id-card",
            type: "idBack" as keyof UploadedImages,
        },
        {
            step: 3,
            title: "Selfie Photo",
            description: "Take a clear selfie holding your ID next to your face",
            icon: "las la-camera",
            type: "selfie" as keyof UploadedImages,
        },
    ];

    const currentStepConfig = stepConfig[currentStep - 1];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {stepConfig.map((step, index) => (
                            <React.Fragment key={step.step}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep >= step.step
                                            ? "bg-primary-600 text-white"
                                            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                                            }`}
                                    >
                                        {currentStep > step.step ? (
                                            <i className="las la-check text-xl"></i>
                                        ) : (
                                            step.step
                                        )}
                                    </div>
                                    <p className="text-xs mt-2 text-center">{step.title}</p>
                                </div>
                                {index < stepConfig.length - 1 && (
                                    <div className="flex-1 h-1 mx-2 bg-neutral-200 dark:bg-neutral-700 relative top-[-20px]">
                                        <div
                                            className={`h-full transition-all ${currentStep > step.step ? "bg-primary-600" : ""
                                                }`}
                                        ></div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep === 4
                                    ? "bg-primary-600 text-white"
                                    : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                                    }`}
                            >
                                {currentStep === 4 ? <i className="las la-paper-plane text-xl"></i> : "4"}
                            </div>
                            <p className="text-xs mt-2">Submit</p>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                {currentStep <= 3 ? (
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-sm">
                        <div className="text-center mb-6">
                            <i className={`${currentStepConfig.icon} text-6xl text-primary-600 mb-4`}></i>
                            <h2 className="text-2xl font-bold mb-2">{currentStepConfig.title}</h2>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                {currentStepConfig.description}
                            </p>
                        </div>

                        {/* Requirements */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                            <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                <i className="las la-info-circle mr-1"></i>
                                Requirements
                            </p>
                            <ul className="text-sm text-blue-900 dark:text-blue-100 space-y-1 ml-5 list-disc">
                                {currentStep === 3 ? (
                                    <>
                                        <li>Hold your ID next to your face</li>
                                        <li>Make sure your face and ID are clearly visible</li>
                                        <li>Good lighting is essential</li>
                                        <li>Remove any masks or sunglasses</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Photo must be clear and all text readable</li>
                                        <li>No glare or shadows</li>
                                        <li>ID must be valid (not expired)</li>
                                        <li>Maximum file size: 5MB</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Upload Area */}
                        {!previews[currentStepConfig.type] ? (
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <i className="las la-cloud-upload-alt text-6xl text-neutral-400 mb-4"></i>
                                    <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        PNG or JPG (MAX. 5MB)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileSelect(currentStepConfig.type, file);
                                    }}
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previews[currentStepConfig.type]!}
                                    alt={currentStepConfig.title}
                                    className="w-full h-64 object-contain bg-neutral-100 dark:bg-neutral-700 rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImages((prev) => ({ ...prev, [currentStepConfig.type]: null }));
                                        setPreviews((prev) => ({ ...prev, [currentStepConfig.type]: null }));
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                                >
                                    <i className="las la-times"></i>
                                </button>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-4 mt-6">
                            {currentStep > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                                >
                                    <i className="las la-arrow-left mr-2"></i>
                                    Back
                                </button>
                            )}
                            <ButtonPrimary onClick={handleNext} className="flex-1">
                                Next
                                <i className="las la-arrow-right ml-2"></i>
                            </ButtonPrimary>
                        </div>
                    </div>
                ) : (
                    // Review and Submit
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-sm">
                        <div className="text-center mb-6">
                            <i className="las la-check-circle text-6xl text-green-600 mb-4"></i>
                            <h2 className="text-2xl font-bold mb-2">Review Your Documents</h2>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Please review all documents before submitting
                            </p>
                        </div>

                        {/* Document Preview Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div>
                                <p className="text-sm font-medium mb-2">ID Front</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previews.idFront!}
                                    alt="ID Front"
                                    className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200 dark:border-neutral-700"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">ID Back</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previews.idBack!}
                                    alt="ID Back"
                                    className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200 dark:border-neutral-700"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Selfie</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previews.selfie!}
                                    alt="Selfie"
                                    className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200 dark:border-neutral-700"
                                />
                            </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                            <p className="text-sm text-green-900 dark:text-green-100">
                                <i className="las la-info-circle mr-1"></i>
                                By submitting, you confirm that all documents are authentic and belong to you.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleBack}
                                className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                disabled={uploading}
                            >
                                <i className="las la-arrow-left mr-2"></i>
                                Back
                            </button>
                            <ButtonPrimary onClick={handleSubmit} className="flex-1" loading={uploading}>
                                {uploading ? "Uploading..." : "Submit for Verification"}
                            </ButtonPrimary>
                        </div>
                    </div>
                )}

                {/* Security Notice */}
                <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    <i className="las la-lock mr-1"></i>
                    Your information is encrypted and secure
                </div>
            </div>
        </div>
    );
}
