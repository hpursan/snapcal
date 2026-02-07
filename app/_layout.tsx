import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { OnboardingService } from '@/services/OnboardingService';
import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const segments = useSegments();
    const navigationState = useRootNavigationState();
    const [loaded] = useFonts({
        // We can add custom fonts here later if needed, e.g. Inter
        // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });
    const [onboardingChecked, setOnboardingChecked] = useState(false);

    // Check onboarding status and redirect
    useEffect(() => {
        const checkOnboarding = async () => {
            // Wait for navigation to be ready
            if (!navigationState?.key || !loaded) return;

            const hasSeenOnboarding = await OnboardingService.hasSeenOnboarding();
            setOnboardingChecked(true);

            // Only redirect if we're not already on onboarding
            const inOnboarding = segments[0] === 'onboarding';

            if (!hasSeenOnboarding && !inOnboarding) {
                // Use setTimeout to avoid navigation during render
                setTimeout(() => {
                    router.replace('/onboarding');
                }, 0);
            }
        };

        checkOnboarding();
    }, [loaded, navigationState?.key, segments]);

    useEffect(() => {
        if (loaded && onboardingChecked) {
            SplashScreen.hideAsync();
        }
    }, [loaded, onboardingChecked]);

    if (!loaded) {
        return null;
    }

    return (
        <CustomThemeProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen
                        name="onboarding"
                        options={{
                            headerShown: false,
                            gestureEnabled: false,
                        }}
                    />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                    <Stack.Screen
                        name="analysis-result"
                        options={{
                            presentation: 'modal',
                            headerShown: false
                        }}
                    />
                    <Stack.Screen
                        name="meal/[id]"
                        options={{
                            headerShown: false
                        }}
                    />
                    <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
            </ThemeProvider>
        </CustomThemeProvider>
    );
}
