import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Platform,
    Text,
    SafeAreaView,
    Button,
    View,
    StyleSheet,
} from 'react-native';
import {
    request,
    PERMISSIONS,
    openSettings,
    RESULTS,
} from 'react-native-permissions'; // For camera permission
import {
    Commands,
    ReactNativeScannerView,
} from '@pushpendersingh/react-native-scanner';
import Sound from 'react-native-sound'


export default function PushScanner({ setShowQrScanner, setQrCodeText, removeQtyFromCode, qrCodeTextCopy, setQrCodeTextCopy }) {
    const scannerRef = useRef(null);
    const [isCameraPermissionGranted, setIsCameraPermissionGranted] =
        useState(false);
    const [isActive, setIsActive] = useState(true);
    const [scannedData, setScannedData] = useState(null);


    const playBeepSound = () => {
        const beep = new Sound(require('../assets/barcode.mp3'), (error) => {
            if (error) {
                console.log("Failed to load sound", error);
                return;
            }
            beep.play((success) => {
                if (!success) {
                    console.log("Playback failed");
                } else {
                    console.log("Playback Worked");
                }
            });
        });
    };

    useEffect(() => {
        checkCameraPermission();
    }, []);

    const handleBarcodeScannedA = event => {
        playBeepSound()

        const { data, bounds, type } = event?.nativeEvent;
        setScannedData({ data, bounds, type });
        setQrCodeText({ data, bounds, type })
        console.log('Barcode / QR Code scanned:', data, bounds, type);

        stopScanning()
    };

    const handleBarcodeScanned = event => {
        playBeepSound();

        const { data, bounds, type } = event?.nativeEvent;
        console.log('Barcode / QR Code scanned:', data, bounds, type);

        if (removeQtyFromCode && data?.length > 4) {
            // Extract item code (excluding last 4 characters) and quantity (last 4 characters)
            const itemCode = data.slice(0, -4); // Get everything except last 4 characters
            const quantity = parseInt(data.slice(-4), 10); // Convert last 4 characters to a number

            setScannedData({ itemCode, quantity, bounds, type });
            setQrCodeText({ itemCode, quantity, bounds, type });

            console.log("Extracted:", { itemCode, quantity });

            // If it's the first scan, set the initial item
            if (qrCodeTextCopy.length === 0) {
                setQrCodeTextCopy([{ itemCode, quantity, bounds, type }]);
                stopScanning();
                return;
            }

            // Check if scanned item matches the first scanned item
            const existingItem = qrCodeTextCopy.find(item => item.itemCode === itemCode);

            if (!existingItem) {
                Alert.alert("Item Code Mismatch"[{ text: "OK" }]);
                return;
            }

            // Update quantity if item already exists
            setQrCodeTextCopy(prev =>
                prev.map(item =>
                    item.itemCode === itemCode
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            );
        } else {
            setScannedData({ data, bounds, type });
            setQrCodeText({ data, bounds, type });
        }

        stopScanning();
    };



    const enableFlashlight = () => {
        if (scannerRef?.current) {
            Commands.enableFlashlight(scannerRef.current);
        }
    };

    const disableFlashlight = () => {
        if (scannerRef?.current) {
            Commands.disableFlashlight(scannerRef.current);
        }
    };

    // Pause the camera after barcode / QR code is scanned
    const stopScanning = () => {
        if (scannerRef?.current) {
            Commands.stopScanning(scannerRef?.current);

            setIsActive(false);
            setShowQrScanner(false)
            console.log('Scanning paused');
        }
    };

    // Resume the camera after barcode / QR code is scanned
    const resumeScanning = () => {
        if (scannerRef?.current) {
            Commands.resumeScanning(scannerRef?.current);
            console.log('Scanning resumed');
        }
    };

    const releaseCamera = () => {
        if (scannerRef?.current) {
            Commands.releaseCamera(scannerRef?.current);
        }
    }

    const startScanning = () => {
        if (scannerRef?.current) {
            Commands.startCamera(scannerRef?.current);
        }
    }

    const checkCameraPermission = async () => {
        request(
            Platform.OS === 'ios'
                ? PERMISSIONS.IOS.CAMERA
                : PERMISSIONS.ANDROID.CAMERA,
        ).then(async (result) => {
            switch (result) {
                case RESULTS.UNAVAILABLE:
                    // console.log('This feature is not available (on this device / in this context)');
                    break;
                case RESULTS.DENIED:
                    Alert.alert(
                        'Permission Denied',
                        'You need to grant camera permission first',
                    );
                    openSettings();
                    break;
                case RESULTS.GRANTED:
                    setIsCameraPermissionGranted(true);
                    break;
                case RESULTS.BLOCKED:
                    Alert.alert(
                        'Permission Blocked',
                        'You need to grant camera permission first',
                    );
                    openSettings();
                    break;
            }
        });
    };

    if (isCameraPermissionGranted) {
        return (
            <SafeAreaView style={styles.container}>
                {isActive && (
                    <ReactNativeScannerView
                        ref={scannerRef}
                        style={styles.scanner}
                        onQrScanned={handleBarcodeScanned}
                        pauseAfterCapture={true} // Pause the scanner after barcode / QR code is scanned
                        isActive={isActive} // Start / stop the scanner using this prop
                        showBox={true} // Show the box around the barcode / QR code
                    />
                )}

                <View style={styles.controls}>
                    <Button
                        title="Stop Scanning"
                        onPress={() => {
                            stopScanning();

                        }}
                    />

                </View>
            </SafeAreaView>
        );
    } else {
        return (
            <Text style={styles.TextStyle}>
                You need to grant camera permission first
            </Text>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    box: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'green',
        zIndex: 10,
    },
    scanner: {
        flex: 1,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
        flexWrap: 'wrap',
        gap: 8,
        marginHorizontal: 10,
    },
    result: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    resultText: {
        fontSize: 16,
        marginVertical: 4,
    },
    TextStyle: {
        fontSize: 30,
        color: 'red',
    },
});

// export default PushScanner