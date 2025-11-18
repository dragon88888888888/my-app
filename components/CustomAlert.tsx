import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: CustomAlertButton[];
  onClose: () => void;
}

export default function CustomAlert({ visible, title, message, buttons, onClose }: CustomAlertProps) {
  const handleButtonPress = (button: CustomAlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View entering={SlideInDown.duration(300)} style={styles.alertContainer}>
          <View style={styles.alert}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}

            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.cancelButton,
                    button.style === 'destructive' && styles.destructiveButton,
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    width: '85%',
    maxWidth: 400,
  },
  alert: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#000000',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
});
