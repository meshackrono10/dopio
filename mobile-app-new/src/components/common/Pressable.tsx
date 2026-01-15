import React from 'react';
import {
    Pressable as RNPressable,
    PressableProps as RNPressableProps,
    StyleProp,
    ViewStyle,
    Platform,
    Animated,
} from 'react-native';
import { colors } from '../../theme';

interface PressableProps extends RNPressableProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    activeOpacity?: number;
    scaleOnPress?: boolean;
}

const Pressable: React.FC<PressableProps> = ({
    children,
    style,
    activeOpacity = 0.7,
    scaleOnPress = true,
    ...props
}) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (scaleOnPress) {
            Animated.spring(scaleValue, {
                toValue: 0.98,
                useNativeDriver: true,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (scaleOnPress) {
            Animated.spring(scaleValue, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        }
    };

    return (
        <RNPressable
            {...props}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            android_ripple={{ color: colors.neutral[200], borderless: false }}
            style={({ pressed }) => [
                style,
                Platform.OS === 'ios' && pressed && { opacity: activeOpacity },
            ]}
        >
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                {children}
            </Animated.View>
        </RNPressable>
    );
};

export default Pressable;
