import { StyleSheet, View, Text, TouchableOpacity, Image, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';

export default function CameraScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={[styles.message, { color: theme.text }]}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const result = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    base64: true,
                    skipProcessing: false,
                });
                if (result?.uri) {
                    setPhoto(result.uri);
                }
            } catch (e) {
                console.error("Failed to take picture", e);
            }
        }
    };

    const retakePicture = () => {
        setPhoto(null);
    };

    const analyzePicture = () => {
        if (photo) {
            router.push({
                pathname: '/analysis-result',
                params: { imageUri: photo }
            });
        }
    };

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo }} style={styles.preview} />
                <View style={styles.previewOverlay}>
                    <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
                        <Text style={styles.retakeText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.analyzeButton} onPress={analyzePicture}>
                        <Text style={styles.analyzeText}>Analyze Meal</Text>
                        <Ionicons name="sparkles" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const pickImage = async () => {
        const result = await launchImageLibraryAsync({
            mediaTypes: MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="back" ref={cameraRef} />

            <View style={styles.cameraOverlay}>
                <View style={styles.guides}>
                    <View style={styles.guideCornerTopLeft} />
                    <View style={styles.guideCornerTopRight} />
                    <View style={styles.guideCornerBottomLeft} />
                    <View style={styles.guideCornerBottomRight} />
                </View>

                <View style={styles.controlsRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                        <Ionicons name="images" size={28} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shutterButtonOuter} onPress={takePicture}>
                        <View style={styles.shutterButtonInner} />
                    </TouchableOpacity>

                    {/* Placeholder for balance */}
                    <View style={styles.iconButton} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 20,
        fontSize: 16,
        paddingHorizontal: 20,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50,
    },
    controlsRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    iconButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterButtonOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterButtonInner: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: '#fff',
    },
    preview: {
        flex: 1,
    },
    previewOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 30,
        paddingBottom: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    retakeButton: {
        padding: 15,
    },
    retakeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    analyzeButton: {
        backgroundColor: Colors.dark.tint,
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    analyzeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Camera Guides
    guides: {
        position: 'absolute',
        top: '15%',
        left: '10%',
        width: '80%',
        height: '55%',
    },
    guideCornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderColor: Colors.dark.tint,
    },
    guideCornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: Colors.dark.tint,
    },
    guideCornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderColor: Colors.dark.tint,
    },
    guideCornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: Colors.dark.tint,
    },
});
