import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { MealService } from '@/services/MealService';
import { MealEntry, ENERGY_BAND_LABELS } from '@/types/Meal';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GlassBackground } from '@/components/GlassBackground';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MealDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [meal, setMeal] = useState<MealEntry | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadMeal();
        }
    }, [id]);

    const loadMeal = async () => {
        const found = await MealService.getMealById(id as string);
        setMeal(found || null);
        setLoading(false);
    };

    const handleDelete = () => {
        Alert.alert("Delete Meal", "Are you sure? This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await MealService.deleteMeal(id as string);
                    router.back();
                }
            }
        ]);
    };

    if (loading) {
        return (
            <GlassBackground>
                <View style={[styles.container, styles.center]}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            </GlassBackground>
        );
    }

    if (!meal) {
        return (
            <GlassBackground>
                <View style={[styles.container, styles.center]}>
                    <Text style={styles.text}>Meal not found.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </GlassBackground>
        );
    }

    return (
        <GlassBackground>
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Full Bleed Image */}
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: meal.photoUri }} style={styles.image} />
                        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                            <Ionicons name="close-circle" size={36} color="rgba(0,0,0,0.5)" />
                        </TouchableOpacity>
                    </View>

                    {/* Glass Sheet Content */}
                    <BlurView intensity={80} tint="light" style={styles.glassSheet}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.mealType}>
                                    {meal.mealType.toUpperCase()}
                                </Text>
                                <Text style={styles.date}>
                                    {new Date(meal.createdAt).toLocaleString()}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleDelete} style={styles.deleteIcon}>
                                <Ionicons name="trash-outline" size={24} color="#ff4444" />
                            </TouchableOpacity>
                        </View>

                        {/* Band Card */}
                        <View style={styles.dataCard}>
                            <Text style={styles.label}>Energy Band</Text>
                            <Text style={styles.bandValue}>
                                {ENERGY_BAND_LABELS[meal.energyBand]}
                            </Text>
                            <View style={[styles.badge, styles[`conf_${meal.confidence}`]]}>
                                <Text style={styles.badgeText}>{meal.confidence} confidence</Text>
                            </View>
                        </View>

                        {/* Insight / Reasoning */}
                        <View style={styles.dataCard}>
                            <Text style={styles.label}>Analysis</Text>
                            <Text style={styles.reasoning}>"{meal.reasoning}"</Text>

                            <View style={styles.flags}>
                                {meal.flags.mixedPlate && <Text style={styles.flag}>🍲 Mixed Plate</Text>}
                                {meal.flags.sharedDish && <Text style={styles.flag}>👥 Shared Dish</Text>}
                                {meal.flags.unclearPortions && <Text style={styles.flag}>❓ Unclear Portions</Text>}
                            </View>
                        </View>
                    </BlurView>
                </ScrollView>
            </View>
        </GlassBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    scroll: { paddingBottom: 50 },

    imageContainer: {
        width: '100%',
        height: 350,
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
        backgroundColor: '#fff',
        borderRadius: 20,
    },

    // key change: glassSheet instead of solid white content
    glassSheet: {
        marginTop: -24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 60,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.65)', // High opacity glass for readability
        minHeight: 500,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    mealType: { fontSize: 28, fontWeight: '800', color: '#222' },
    date: { color: '#666', marginTop: 4 },
    deleteIcon: { padding: 8 },

    dataCard: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fff',
    },
    label: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    bandValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
    conf_high: { backgroundColor: '#4CAF50' },
    conf_medium: { backgroundColor: '#FFBB33' },
    conf_low: { backgroundColor: '#ff4444' },

    reasoning: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
        fontStyle: 'italic',
    },
    flags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    flag: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 12,
        color: '#555',
        borderWidth: 1,
        borderColor: '#eee',
    },

    text: { fontSize: 18, marginBottom: 20, color: '#222' },
    backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 8 },
    backButtonText: { fontSize: 16, color: '#333' },
});
