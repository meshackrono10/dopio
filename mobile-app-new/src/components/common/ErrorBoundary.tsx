/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // In production, send to error tracking service (Sentry, etc.)
        if (__DEV__) {
            console.log('Error Stack:', errorInfo.componentStack);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="alert-circle" size={64} color={colors.error} />
                    </View>

                    <Text style={styles.title}>Oops! Something went wrong</Text>

                    <Text style={styles.message}>
                        We're sorry for the inconvenience. The app encountered an unexpected error.
                    </Text>

                    {__DEV__ && this.state.error && (
                        <View style={styles.errorDetails}>
                            <Text style={styles.errorTitle}>Error Details:</Text>
                            <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.neutral[50],
    },
    iconContainer: {
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h2,
        color: colors.text.light,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    message: {
        ...typography.body,
        color: colors.neutral[600],
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    errorDetails: {
        backgroundColor: colors.neutral[100],
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xl,
        maxWidth: '100%',
    },
    errorTitle: {
        ...typography.bodySemiBold,
        color: colors.error,
        marginBottom: spacing.sm,
    },
    errorText: {
        ...typography.caption,
        color: colors.neutral[700],
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: colors.primary[600],
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
        minWidth: 150,
    },
    buttonText: {
        ...typography.button,
        color: 'white',
        textAlign: 'center',
    },
});

export default ErrorBoundary;
