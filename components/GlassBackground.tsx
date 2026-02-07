import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSequence
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

const AnimatedView = Animated.createAnimatedComponent(View);

export function GlassBackground({ children }: { children: React.ReactNode }) {
    const { width, height } = useWindowDimensions();
    const { isDark } = useTheme();

    // Shared values for animation
    const rotate1 = useSharedValue(0);
    const rotate2 = useSharedValue(0);
    const scale1 = useSharedValue(1);
    const scale2 = useSharedValue(1);

    useEffect(() => {
        // Blob 1 Animation: Clockwise Rotation + Breathing
        rotate1.value = withRepeat(
            withTiming(360, { duration: 20000, easing: Easing.linear }),
            -1
        );
        scale1.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1.0, { duration: 8000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Blob 2 Animation: Counter-Clockwise + Deep Breathing
        rotate2.value = withRepeat(
            withTiming(-360, { duration: 25000, easing: Easing.linear }),
            -1
        );
        scale2.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.9, { duration: 10000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle1 = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotate1.value}deg` },
            { scale: scale1.value }
        ],
    }));

    const animatedStyle2 = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotate2.value}deg` },
            { scale: scale2.value }
        ],
    }));

    return (
        <View style={styles.container}>
            {/* 1. Base Gradient Layer */}
            <LinearGradient
                colors={isDark
                    ? ['#1a1a2e', '#16213e', '#0f3460']
                    : ['#E0C3FC', '#8EC5FC', '#E0C3FC']
                }
                start={{ x: 0.1, y: 0.1 }}
                end={{ x: 0.9, y: 0.9 }}
                style={StyleSheet.absoluteFill}
            />

            {/* 2. Animated Blob Layer */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">

                {/* Blob 1: Top Left (Warm/Pink) */}
                <AnimatedView style={[StyleSheet.absoluteFill, animatedStyle1]}>
                    <Svg height={height * 1.5} width={width * 1.5} style={{ position: 'absolute', top: -height * 0.2, left: -width * 0.2 }}>
                        <Defs>
                            <RadialGradient id="grad1" cx="50%" cy="50%" rx="50%" ry="50%">
                                <Stop offset="0" stopColor="#FF9A9E" stopOpacity="0.7" />
                                <Stop offset="1" stopColor="#FF9A9E" stopOpacity="0" />
                            </RadialGradient>
                        </Defs>
                        <Circle cx="50%" cy="50%" r="40%" fill="url(#grad1)" />
                    </Svg>
                </AnimatedView>

                {/* Blob 2: Bottom Right (Cool/Purple) */}
                <AnimatedView style={[StyleSheet.absoluteFill, animatedStyle2]}>
                    <Svg height={height * 1.5} width={width * 1.5} style={{ position: 'absolute', top: height * 0.2, left: width * 0.2 }}>
                        <Defs>
                            <RadialGradient id="grad2" cx="50%" cy="50%" rx="50%" ry="50%">
                                <Stop offset="0" stopColor="#A18CD1" stopOpacity="0.7" />
                                <Stop offset="1" stopColor="#A18CD1" stopOpacity="0" />
                            </RadialGradient>
                        </Defs>
                        <Circle cx="50%" cy="50%" r="45%" fill="url(#grad2)" />
                    </Svg>
                </AnimatedView>
            </View>

            {/* 3. Content Layer */}
            <View style={{ flex: 1 }}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
