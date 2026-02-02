import React, { useEffect, useRef } from 'react';
import { TextInput, Animated, StyleSheet, TextInputProps } from 'react-native';

interface GlowInputProps extends TextInputProps {
    glowColor?: string;
}

export function GlowInput({ style, glowColor = '#fff', ...props }: GlowInputProps) {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: false,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: false,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const borderColor = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,255,255,0.2)', glowColor]
    });

    const shadowOpacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6]
    });

    return (
        <Animated.View style={[
            styles.container,
            {
                borderColor: borderColor,
                shadowColor: glowColor,
                shadowOpacity: shadowOpacity,
            }
        ]}>
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor="rgba(255,255,255,0.5)"
                {...props}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1.5,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        justifyContent: 'center',
    },
    input: {
        // Default styles that can be overridden
        paddingHorizontal: 8,
        paddingVertical: 4,
        color: '#fff',
    }
});
