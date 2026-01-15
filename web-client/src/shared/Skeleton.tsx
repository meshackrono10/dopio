import React from "react";

interface SkeletonProps {
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
    return (
        <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-md ${className}`}></div>
    );
};

export default Skeleton;
