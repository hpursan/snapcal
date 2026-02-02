import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import { useMeals } from '@/context/MealContext';

export default function OnboardingScreen() {
    const router = useRouter();
    const { updateGoals } = useMeals();
    const [weight, setWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');

    const handleStart = () => {
        if (!weight || !goalWeight) {
            Alert.alert("Missing Info", "Please fill in your weight and goal.");
            return;
        }

        // Simple BMR Calc (simplified for MVP)
        // Assume active male for now, adjust later in settings
        const currentW = parseFloat(weight);
        const estimatedCalories = currentW * 29; // approximate maintenance
        const protein = currentW * 2.2; // 2.2g per kg (Example high protein)

        updateGoals({
            currentWeight: weight,
            targetWeight: goalWeight,
            calories: Math.round(estimatedCalories),
            protein: Math.round(protein),
            carbs: Math.round((estimatedCalories * 0.4) / 4),
            fats: Math.round((estimatedCalories * 0.3) / 9),
            isOnboarded: true
        });

        router.replace('/(tabs)');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Let's get started</Text>
                    <Text style={styles.subtitle}>We need this to calibrate your goals.</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Current Weight (kg)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 75"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                            returnKeyType="done"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Goal Weight (kg)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 70"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={goalWeight}
                            onChangeText={setGoalWeight}
                            returnKeyType="done"
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleStart}>
                        <Text style={styles.buttonText}>Start Tracking</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        gap: 20,
    },
    title: {
        color: Colors.dark.text,
        fontSize: 32,
        fontWeight: 'bold',
    },
    subtitle: {
        color: Colors.dark.tabIconDefault,
        fontSize: 16,
        marginBottom: 20,
    },
    inputContainer: {
        gap: 10,
    },
    label: {
        color: Colors.dark.text,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: Colors.dark.cardBackground,
        color: Colors.dark.text,
        padding: 15,
        borderRadius: 12,
        fontSize: 18,
        borderWidth: 1,
        borderColor: Colors.dark.gray,
    },
    button: {
        backgroundColor: Colors.dark.primary,
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: Colors.dark.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
