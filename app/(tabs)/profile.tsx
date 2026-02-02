import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useMeals } from '@/context/MealContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const { goals, clearAllData } = useMeals();
    const router = useRouter();

    const handleReset = () => {
        Alert.alert("Reset Data", "Are you sure? This will delete all meals and reset your goals. This action cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete Everything",
                style: "destructive",
                onPress: async () => {
                    await clearAllData();
                    router.replace('/');
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Current Weight</Text>
                <Text style={styles.value}>{goals.currentWeight || '--'} kg</Text>

                <View style={styles.divider} />

                <Text style={styles.label}>Goal Weight</Text>
                <Text style={styles.value}>{goals.targetWeight || '--'} kg</Text>

                <View style={styles.divider} />

                <Text style={styles.label}>Daily Calories</Text>
                <Text style={styles.value}>{goals.calories} kcal</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleReset}>
                <Text style={styles.buttonText}>Delete All Data</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
        padding: 20,
        paddingTop: 60,
    },
    title: {
        color: Colors.dark.text,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    card: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: 20,
        padding: 24,
        marginBottom: 30,
    },
    label: {
        color: Colors.dark.tabIconDefault,
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        color: Colors.dark.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.dark.gray,
        marginVertical: 16,
    },
    button: {
        backgroundColor: Colors.dark.cardBackground,
        borderWidth: 1,
        borderColor: Colors.dark.danger,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.dark.danger,
        fontSize: 18,
        fontWeight: '600',
    }
});
