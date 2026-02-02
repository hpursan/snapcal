import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { MealProvider } from '@/context/MealContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        // We can add custom fonts here later if needed, e.g. Inter
        // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <MealProvider>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="auth/onboarding" options={{ headerShown: false }} />
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
            </MealProvider>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
