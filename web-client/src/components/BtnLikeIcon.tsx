"use client";

import React, { FC, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export interface BtnLikeIconProps {
  className?: string;
  colorClass?: string;
  isLiked?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const BtnLikeIcon: FC<BtnLikeIconProps> = ({
  className = "",
  colorClass = "text-white bg-black bg-opacity-30 hover:bg-opacity-50",
  isLiked = false,
  onClick,
}) => {
  const [likedState, setLikedState] = useState(isLiked);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Update local state when prop changes
  React.useEffect(() => {
    setLikedState(isLiked);
  }, [isLiked]);

  const handleClick = (e: React.MouseEvent) => {
    console.log("[BtnLikeIcon] Click detected!", { onClick: !!onClick, isAuthenticated });
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      console.log("[BtnLikeIcon] Calling external onClick handler");
      onClick(e);
    } else {
      console.log("[BtnLikeIcon] Using fallback behavior");
      // Fallback to old behavior if no onClick provided
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      setLikedState(!likedState);
    }
  };

  return (
    <div
      className={`nc-BtnLikeIcon w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${likedState ? "nc-BtnLikeIcon--liked" : ""
        }  ${colorClass} ${className}`}
      data-nc-id="BtnLikeIcon"
      title="Save"
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill={likedState ? "currentColor" : "none"}
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
    </div>
  );
};

export default BtnLikeIcon;
