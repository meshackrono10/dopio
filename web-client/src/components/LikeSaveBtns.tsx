"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useToast } from "@/components/Toast";

interface LikeSaveBtnsProps {
  propertyId?: string;
}

const LikeSaveBtns: React.FC<LikeSaveBtnsProps> = ({ propertyId }) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = React.useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && propertyId) {
        try {
          const response = await api.get("/users/saved-properties");
          const savedProps = response.data;
          const isPropertySaved = savedProps.some((p: any) => p.propertyId === propertyId);
          setIsSaved(isPropertySaved);
        } catch (error) {
          console.error("Failed to check saved status", error);
        }
      }
    };
    checkSavedStatus();
  }, [isAuthenticated, propertyId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast("success", "Link copied to clipboard!");
    }
  };

  const handleSave = async () => {
    console.log("[LikeSaveBtns] Save clicked", { isAuthenticated, propertyId });
    if (!isAuthenticated) {
      console.log("[LikeSaveBtns] Not authenticated, redirecting to login");
      router.push("/login");
      return;
    }

    if (!propertyId) {
      console.error("[LikeSaveBtns] No propertyId provided!");
      return;
    }

    console.log("[LikeSaveBtns] Sending save request to:", `/users/saved-properties/${propertyId}`);
    try {
      const response = await api.post(`/users/saved-properties/${propertyId}`);
      console.log("[LikeSaveBtns] Save response:", response.data);
      setIsSaved(response.data.isSaved);
      showToast("success", response.data.message);
    } catch (error: any) {
      console.error("[LikeSaveBtns] Failed to toggle save:", error);
      console.error("[LikeSaveBtns] Error response:", error.response?.data);
      showToast("error", "Failed to update saved status");
    }
  };

  return (
    <div className="flow-root">
      <div className="flex text-neutral-700 dark:text-neutral-300 text-sm -mx-3 -my-1.5">
        <span
          onClick={handleShare}
          className="py-1.5 px-3 flex rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="hidden sm:block ml-2.5">Share</span>
        </span>
        <span
          onClick={handleSave}
          className="py-1.5 px-3 flex rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${isSaved ? "text-red-500 fill-current" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="hidden sm:block ml-2.5">{isSaved ? "Saved" : "Save"}</span>
        </span>
      </div>
    </div>
  );
};

export default LikeSaveBtns;
