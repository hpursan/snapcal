import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useMeals } from '@/context/MealContext';
import { useState, useEffect } from 'react';
import { GlowInput } from '@/components/GlowInput';

export default function EditMealScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { meals, updateMeal } = useMeals();

    // Find meal from context
    const meal = meals.find(m => m.id === id);

    const [isEditing, setIsEditing] = useState(false);

    // Initial Data
    const [foodName, setFoodName] = useState("");
    const [calories, setCalories] = useState("0");
    const [protein, setProtein] = useState("0");
    const [carbs, setCarbs] = useState("0");
    const [fats, setFats] = useState("0");

    useEffect(() => {
        if (meal) {
            setFoodName(meal.name);
            setCalories(meal.calories.toString());
            setProtein(meal.protein.toString());
            setCarbs(meal.carbs.toString());
            setFats(meal.fats.toString());
        }
    }, [meal]);


    if (!meal) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>Meal not found</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Text style={{ color: Colors.dark.tint, textAlign: 'center' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const validateNumber = (text: string, setter: (val: string) => void) => {
        if (/^\d*$/.test(text)) {
            setter(text);
        }
    };

    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (meal) {
            const hasChanged =
                meal.name !== foodName ||
                meal.calories.toString() !== calories ||
                meal.protein.toString() !== protein ||
                meal.carbs.toString() !== carbs ||
                meal.fats.toString() !== fats;

            setIsDirty(hasChanged);
        }
    }, [foodName, calories, protein, carbs, fats, meal]);

    const handleSave = () => {
        if (!isDirty) return;
        updateMeal(meal.id, {
            name: foodName,
            calories: parseInt(calories) || 0,
            protein: parseInt(protein) || 0,
            carbs: parseInt(carbs) || 0,
            fats: parseInt(fats) || 0,
        });
        router.back();
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Image Preview */}
                <View style={styles.imageContainer}>
                    {meal.imageUri ? (
                        <Image source={{ uri: meal.imageUri }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, { backgroundColor: '#333' }]} />
                    )}
                    <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                        <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                </View>

                {/* Content Card */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        {isEditing ? (
                            <GlowInput
                                style={[styles.foodNameInput, { color: Colors.dark.text, borderBottomWidth: 0 }]}
                                value={foodName}
                                onChangeText={setFoodName}
                                autoFocus
                                glowColor={Colors.dark.tint}
                            />
                        ) : (
                            <Text style={styles.foodName}>{foodName}</Text>
                        )}

                        <View style={styles.caloriesBadge}>
                            {isEditing ? (
                                <GlowInput
                                    style={[styles.caloriesText]}
                                    value={calories}
                                    onChangeText={(text) => validateNumber(text, setCalories)}
                                    keyboardType="numeric"
                                    glowColor="#fff"
                                />
                            ) : (
                                <Text style={styles.caloriesText}>{calories}</Text>
                            )}
                            <Text style={styles.caloriesLabel}>kcal</Text>
                        </View>
                    </View>

                    <Text style={styles.timestamp}>Logged at: {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>

                    <View style={styles.divider} />

                    {/* Macros */}
                    <View style={styles.macrosContainer}>
                        <MacroItem
                            label="Protein"
                            value={protein}
                            onChange={(text) => validateNumber(text, setProtein)}
                            isEditing={isEditing}
                            color={Colors.dark.primary}
                        />
                        <MacroItem
                            label="Carbs"
                            value={carbs}
                            onChange={(text) => validateNumber(text, setCarbs)}
                            isEditing={isEditing}
                            color={Colors.dark.success}
                        />
                        <MacroItem
                            label="Fats"
                            value={fats}
                            onChange={(text) => validateNumber(text, setFats)}
                            isEditing={isEditing}
                            color={Colors.dark.accent}
                        />
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(!isEditing)}>
                        <Text style={styles.editText}>{isEditing ? "Done" : "Edit Details"}</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.actionBar}>
                {isEditing && isDirty ? (
                    <>
                        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => {
                            // Reset values
                            setFoodName(meal.name);
                            setCalories(meal.calories.toString());
                            setProtein(meal.protein.toString());
                            setCarbs(meal.carbs.toString());
                            setFats(meal.fats.toString());
                            setIsEditing(false);
                        }}>
                            <Ionicons name="close" size={24} color="#fff" />
                            <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
                            <Text style={styles.actionButtonText}>Save</Text>
                            <Ionicons name="save" size={24} color="#fff" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.dark.gray }]} onPress={() => router.back()}>
                        <Text style={styles.actionButtonText}>Close</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

function MacroItem({ label, value, color, isEditing, onChange }: {
    label: string,
    value: string,
    color: string,
    isEditing: boolean,
    onChange: (val: string) => void
}) {
    return (
        <View style={styles.macroItem}>
            {isEditing ? (
                <GlowInput
                    style={[styles.macroValue, { color }]}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    glowColor={color}
                />
            ) : (
                <Text style={[styles.macroValue, { color }]}>{value}g</Text>
            )}
            <Text style={styles.macroLabel}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    card: {
        backgroundColor: Colors.dark.cardBackground,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        padding: 24,
        minHeight: 500,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    foodName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.dark.text,
        flex: 1,
        marginRight: 10,
    },
    foodNameInput: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.dark.text,
        flex: 1,
        marginRight: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.gray,
    },
    caloriesBadge: {
        alignItems: 'center',
        backgroundColor: Colors.dark.gray,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    caloriesText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
    },
    caloriesLabel: {
        fontSize: 12,
        color: '#aaa',
        textTransform: 'uppercase',
    },
    timestamp: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.dark.gray,
        marginVertical: 20,
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    macroItem: {
        alignItems: 'center',
    },
    macroValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    macroLabel: {
        fontSize: 14,
        color: '#888',
    },
    editButton: {
        alignSelf: 'center',
        padding: 10,
    },
    editText: {
        color: Colors.dark.tint,
        fontSize: 16,
        fontWeight: '600',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: Colors.dark.cardBackground,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.gray,
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.dark.danger,
    },
    saveButton: {
        backgroundColor: Colors.dark.success, // Use Success Green for Save
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 4,
    }
});
