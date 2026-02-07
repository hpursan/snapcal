import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    FadeInDown,
    FadeInUp
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedGlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    delay?: number; // For staggered entry
    intensity?: number;
}

export function AnimatedGlassCard({
    children,
    style,
    onPress,
    delay = 0,
    intensity = 50
}: AnimatedGlassCardProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 10 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10 });
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            entering={FadeInDown.delay(delay).springify()}
            style={[styles.container, style, animatedStyle]}
        >
            <BlurView intensity={intensity} tint="light" style={styles.blur}>
                {children}
            </BlurView>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    blur: {
        flex: 1,
        padding: 16,
    }
});
