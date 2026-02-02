import { Redirect } from 'expo-router';
import { useMeals } from '@/context/MealContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { goals, isLoading } = useMeals();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    if (!goals.isOnboarded) {
        return <Redirect href="/auth/onboarding" />;
    }

    return <Redirect href="/(tabs)" />;
}
