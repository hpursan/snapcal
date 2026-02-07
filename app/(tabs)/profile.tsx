import { StyleSheet, View, Text, TouchableOpacity, Alert, SafeAreaView, Switch, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { MealService } from '@/services/MealService';
import { OnboardingService } from '@/services/OnboardingService';
import { GlassBackground } from '@/components/GlassBackground';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();

    const handleReset = () => {
        Alert.alert("Reset Data", "Are you sure? This will delete all local meal logs. This action cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete Everything",
                style: "destructive",
                onPress: async () => {
                    await MealService.clearAll();
                    Alert.alert("Data Cleared", "Local storage has been wiped.");
                }
            }
        ]);
    };

    const handleResetOnboarding = () => {
        Alert.alert("Reset Onboarding", "This will show the onboarding flow again on next app restart.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Reset",
                onPress: async () => {
                    await OnboardingService.resetOnboarding();
                    Alert.alert("Done", "Restart the app to see onboarding again.");
                }
            }
        ]);
    };

    const handleOpenPrivacyPolicy = async () => {
        const url = 'https://hpursan.github.io/aperioesca-legal/privacy.html';
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', 'Unable to open Privacy Policy');
        }
    };

    const handleOpenTerms = async () => {
        const url = 'https://hpursan.github.io/aperioesca-legal/terms.html';
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', 'Unable to open Terms of Service');
        }
    };

    return (
        <GlassBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Text style={[styles.title, { color: isDark ? '#fff' : '#333' }]}>Settings</Text>

                    <BlurView intensity={50} tint="light" style={styles.glassCard}>
                        {/* Dark Mode Toggle */}
                        <View style={[styles.row, { justifyContent: 'space-between' }]}>
                            <View style={styles.row}>
                                <Ionicons name={isDark ? "moon" : "sunny"} size={24} color="#333" />
                                <Text style={styles.label}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#ddd', true: '#A18CD1' }}
                                thumbColor={isDark ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Ionicons name="information-circle-outline" size={24} color="#333" />
                            <Text style={styles.label}>App Version</Text>
                        </View>
                        <Text style={styles.value}>1.0.0 (Aperioesca)</Text>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
                            <Text style={styles.label}>Data Privacy</Text>
                        </View>
                        <Text style={styles.description}>
                            Your meal photos and logs are stored locally on your device.
                            AI analysis is stateless (no images saved on server).
                        </Text>

                        <View style={styles.divider} />

                        {/* Legal Links */}
                        <TouchableOpacity style={styles.linkRow} onPress={handleOpenPrivacyPolicy}>
                            <View style={styles.row}>
                                <Ionicons name="document-text-outline" size={24} color="#6FEDD6" />
                                <Text style={[styles.label, { color: '#6FEDD6' }]}>Privacy Policy</Text>
                            </View>
                            <Ionicons name="open-outline" size={20} color="#6FEDD6" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.linkRow} onPress={handleOpenTerms}>
                            <View style={styles.row}>
                                <Ionicons name="document-text-outline" size={24} color="#FF6B9D" />
                                <Text style={[styles.label, { color: '#FF6B9D' }]}>Terms of Service</Text>
                            </View>
                            <Ionicons name="open-outline" size={20} color="#FF6B9D" />
                        </TouchableOpacity>
                    </BlurView>

                    <TouchableOpacity style={styles.button} onPress={handleReset}>
                        <Text style={styles.buttonText}>Clear Local Data</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, { backgroundColor: '#A18CD1', marginTop: 12 }]} onPress={handleResetOnboarding}>
                        <Text style={styles.buttonText}>Reset Onboarding (Debug)</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </GlassBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    label: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    value: {
        color: '#222',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    description: {
        color: '#555',
        fontSize: 14,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginVertical: 16,
    },
    button: {
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        borderWidth: 1,
        borderColor: '#ff5252',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonText: {
        color: '#ff5252',
        fontSize: 18,
        fontWeight: '600',
    }
});
