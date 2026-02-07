import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassBackground } from '@/components/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingService } from '@/services/OnboardingService';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        icon: 'flash' as const,
        iconColor: '#FF6B6B',
        title: 'Energy Bands,\nNot Calories',
        body: 'Snapcal helps you understand your meals through simple energy bands—Light, Moderate, or Heavy.\n\nNo math, no guilt, just awareness.',
    },
    {
        icon: 'lock-closed' as const,
        iconColor: '#4ECDC4',
        title: 'Your Data\nStays Private',
        body: 'Everything is stored locally on your device. No cloud sync, no accounts, no tracking.\n\nYour food journal is yours alone.',
    },
    {
        icon: 'camera' as const,
        iconColor: '#A18CD1',
        title: 'Ready to\nGet Started?',
        body: 'Snap a photo of your next meal and get instant insights.\n\nLet\'s build awareness together.',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            const nextSlide = currentSlide + 1;
            setCurrentSlide(nextSlide);
            scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
        }
    };

    const handleSkip = async () => {
        await OnboardingService.markOnboardingComplete();
        router.replace('/(tabs)');
    };

    const handleGetStarted = async () => {
        await OnboardingService.markOnboardingComplete();
        router.replace('/(tabs)');
    };

    const isLastSlide = currentSlide === SLIDES.length - 1;

    return (
        <GlassBackground>
            <View style={styles.container}>
                {/* Skip Button */}
                <Animated.View
                    entering={FadeInDown.delay(200)}
                    style={styles.skipContainer}
                >
                    <Pressable onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </Pressable>
                </Animated.View>

                {/* Carousel */}
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                    style={styles.scrollView}
                >
                    {SLIDES.map((slide, index) => (
                        <View key={index} style={styles.slide}>
                            <Animated.View
                                entering={FadeInUp.delay(300)}
                                style={styles.content}
                            >
                                {/* Icon */}
                                <View style={[styles.iconContainer, { backgroundColor: `${slide.iconColor}20` }]}>
                                    <Ionicons name={slide.icon} size={64} color={slide.iconColor} />
                                </View>

                                {/* Title */}
                                <Text style={styles.title}>{slide.title}</Text>

                                {/* Body */}
                                <Text style={styles.body}>{slide.body}</Text>
                            </Animated.View>
                        </View>
                    ))}
                </ScrollView>

                {/* Pagination Dots */}
                <Animated.View
                    entering={FadeInDown.delay(400)}
                    style={styles.pagination}
                >
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentSlide === index && styles.dotActive,
                            ]}
                        />
                    ))}
                </Animated.View>

                {/* Action Button */}
                <Animated.View
                    entering={FadeInDown.delay(500)}
                    style={styles.buttonContainer}
                >
                    <Pressable
                        onPress={isLastSlide ? handleGetStarted : handleNext}
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {isLastSlide ? "Let's Go!" : 'Next'}
                        </Text>
                        <Ionicons
                            name={isLastSlide ? "checkmark-circle" : "arrow-forward"}
                            size={24}
                            color="#fff"
                            style={{ marginLeft: 8 }}
                        />
                    </Pressable>
                </Animated.View>
            </View>
        </GlassBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingBottom: 40,
    },
    skipContainer: {
        alignItems: 'flex-end',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    skipButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 20,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#222',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 40,
    },
    body: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 32,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    dotActive: {
        width: 24,
        backgroundColor: '#A18CD1',
    },
    buttonContainer: {
        paddingHorizontal: 32,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#A18CD1',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
});
