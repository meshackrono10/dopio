import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { PropertyProvider } from './src/contexts/PropertyContext';
import { BookingProvider } from './src/contexts/BookingContext';
import { InvoiceProvider } from './src/contexts/InvoiceContext';
import { ComparisonProvider } from './src/contexts/ComparisonContext';
import { WalletProvider } from './src/contexts/WalletContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { WishlistProvider } from './src/contexts/WishlistContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { ChatProvider } from './src/contexts/ChatContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import Toast from './src/components/common/Toast';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <NotificationProvider>
                  <WalletProvider>
                    <PropertyProvider>
                      <ComparisonProvider>
                        <BookingProvider>
                          <InvoiceProvider>
                            <WishlistProvider>
                              <ChatProvider>
                                <StatusBar style="auto" />
                                <RootNavigator />
                                <Toast />
                              </ChatProvider>
                            </WishlistProvider>
                          </InvoiceProvider>
                        </BookingProvider>
                      </ComparisonProvider>
                    </PropertyProvider>
                  </WalletProvider>
                </NotificationProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

