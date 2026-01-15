/**
 * Formatter Utilities
 * Common formatting functions for currency, dates, and numbers
 */

/**
 * Format number as Kenyan Shillings
 */
export const formatCurrency = (amount: number): string => {
    return `KES ${amount.toLocaleString('en-KE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Format date to short format (e.g., "Jan 5, 2025")
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Format date to long format (e.g., "January 5, 2025")
 */
export const formatDateLong = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Format time (e.g., "2:30 PM")
 */
export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format date and time (e.g., "Jan 5, 2025 • 2:30 PM")
 */
export const formatDateTime = (dateString: string): string => {
    return `${formatDate(dateString)} • ${formatTime(dateString)}`;
};

/**
 * Format phone number (KE format)
 */
export const formatPhone = (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as: 0712 345 678
    if (cleaned.startsWith('254')) {
        const local = '0' + cleaned.substring(3);
        return formatPhone(local);
    }

    if (cleaned.length === 10) {
        return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
    }

    return phone;
};

/**
 * Format number with abbreviation (e.g., 1.5K, 2.3M)
 */
export const formatNumberShort = (num: number): string => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}m`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals = 0): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Title case (capitalize each word)
 */
export const titleCase = (text: string): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
