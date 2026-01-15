export const colors = {
    primary: {
        50: '#F5F3FF',
        100: '#EDE9FE',
        200: '#DDD6FE',
        300: '#C4B5FD',
        400: '#A78BFA',
        500: '#8B5CF6', // Premium Violet/Indigo
        600: '#7C3AED',
        700: '#6D28D9',
        800: '#5B21B6',
        900: '#4C1D95',
    },
    secondary: {
        50: '#FFF1F2',
        100: '#FFE4E6',
        200: '#FECDD3',
        300: '#FDA4AF',
        400: '#FB7185',
        500: '#F43F5E', // Rose/Coral like Airbnb
        600: '#E11D48',
        700: '#BE123C',
        800: '#9F1239',
        900: '#881337',
    },
    neutral: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
    },
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    background: {
        light: '#FFFFFF',
        dark: '#0F172A',
    },
    text: {
        light: '#0F172A',
        dark: '#F8FAFC',
        muted: '#64748B',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

export const borderRadius = {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    full: 9999,
};

export const typography = {
    h1: {
        fontSize: 34,
        fontWeight: '800' as const,
        lineHeight: 42,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 28,
        fontWeight: '700' as const,
        lineHeight: 36,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 22,
        fontWeight: '700' as const,
        lineHeight: 30,
    },
    h4: {
        fontSize: 18,
        fontWeight: '600' as const,
        lineHeight: 26,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    bodySemiBold: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '500' as const,
        lineHeight: 16,
    },
    button: {
        fontSize: 16,
        fontWeight: '700' as const,
        lineHeight: 24,
    },
};

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
        elevation: 16,
    },
};

export const animations = {
    durations: {
        fast: 200,
        normal: 300,
        slow: 500,
    },
    easing: {
        easeInOut: 'ease-in-out',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
    },
};
