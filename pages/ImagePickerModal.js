
import Modal from 'react-native-modal';
import React from 'react';
import { SafeAreaView, Text, Image, Pressable, StyleSheet } from 'react-native';
import ic_camera from "../images/ic_camera_model.png"
import ic_image from "../images/ic_camera_model.png"

export function ImagePickerModal({
    isVisible,
    onClose,
    onImageLibraryPress,handleTakePhoto
  }) {
    return (
      <Modal
        isVisible={isVisible}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}
        style={styles.modal}>
        <SafeAreaView style={styles.buttons}>
          <Pressable style={styles.button} onPress={onImageLibraryPress}>
            <Image style={styles.buttonIcon} source={ic_image} />
            <Text style={styles.buttonText}>Library</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleTakePhoto}>
            <Image style={styles.buttonIcon} source={ic_camera} />
            <Text style={styles.buttonText}>Camera</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    );
  }

  const styles = StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    buttonIcon: {
      width: 30,
      height: 30,
      margin: 10,
    },
    buttons: {
      backgroundColor: 'white',
      flexDirection: 'row',
      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
    },
    button: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
    },
  });