"use client";

import React from "react";

export interface StarRatingProps {
    rating: number; // 0-5
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    showNumber?: boolean;
    interactive?: boolean;
    onChange?: (rating: number) => void;
    className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    size = "md",
    showNumber = false,
    interactive = false,
    onChange,
    className = "",
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);
    const [localRating, setLocalRating] = React.useState(rating);

    React.useEffect(() => {
        setLocalRating(rating);
    }, [rating]);

    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-xl",
    };

    const handleClick = (value: number) => {
        if (!interactive) return;
        setLocalRating(value);
        onChange?.(value);
    };

    const handleMouseEnter = (value: number) => {
        if (!interactive) return;
        setHoverRating(value);
    };

    const handleMouseLeave = () => {
        if (!interactive) return;
        setHoverRating(0);
    };

    const displayRating = hoverRating || localRating;

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
                {Array.from({ length: maxRating }, (_, index) => {
                    const value = index + 1;
                    const isFilled = value <= Math.floor(displayRating);
                    const isHalfFilled =
                        value === Math.ceil(displayRating) &&
                        displayRating % 1 !== 0 &&
                        !hoverRating;

                    return (
                        <span
                            key={index}
                            className={`relative ${interactive ? "cursor-pointer" : ""
                                } transition-transform ${interactive && hoverRating >= value ? "scale-110" : ""
                                }`}
                            onClick={() => handleClick(value)}
                            onMouseEnter={() => handleMouseEnter(value)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {isHalfFilled ? (
                                <span className="relative">
                                    <i className="las la-star text-neutral-300 dark:text-neutral-600"></i>
                                    <i
                                        className="las la-star-half absolute top-0 left-0 text-yellow-500"
                                        style={{ clipPath: "inset(0 50% 0 0)" }}
                                    ></i>
                                </span>
                            ) : (
                                <i
                                    className={`las la-star ${isFilled
                                            ? "text-yellow-500"
                                            : "text-neutral-300 dark:text-neutral-600"
                                        }`}
                                ></i>
                            )}
                        </span>
                    );
                })}
            </div>
            {showNumber && (
                <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-1">
                    {displayRating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
