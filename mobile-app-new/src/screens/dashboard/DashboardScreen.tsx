import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme';
import TenantDashboard from '../../components/tenant/TenantDashboard';
import HunterDashboard from '../../components/hunter/HunterDashboard';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();

    const renderDashboard = () => {
        switch (user?.role) {
            case 'hunter':
                return (
                    <HunterDashboard
                        onNavigateToBookings={() => (navigation as any).navigate('BookingsTab')}
                        onNavigateToChat={(id: string) => (navigation as any).navigate('MessagesTab', { screen: 'Chat', params: { id } })}
                    />
                );
            case 'admin':
                return <AdminDashboard />;
            case 'tenant':
            default:
                return (
                    <TenantDashboard
                        onNavigateToSearch={() => (navigation as any).navigate('ExploreTab')}
                        onNavigateToBookings={() => (navigation as any).navigate('BookingsTab')}
                        onNavigateToChat={(id: string) => (navigation as any).navigate('MessagesTab', { screen: 'Chat', params: { id } })}
                    />
                );
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            {renderDashboard()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default DashboardScreen;
