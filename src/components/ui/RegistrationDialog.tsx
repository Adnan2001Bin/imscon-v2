import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { loginScreenStyles } from '../styles/LoginScreen.styles';

interface RegistrationDialogProps {
  visible: boolean;
  onCancel: () => void;
  onSignUp: () => void;
  title?: string;
  message?: string;
}

export default function RegistrationDialog({
  visible,
  onCancel,
  onSignUp,
  title = 'Not registered',
  message = 'This email is not registered. Do you want to sign up?',
}: RegistrationDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={loginScreenStyles.dialogOverlay}>
        <View style={loginScreenStyles.dialogContainer}>
          <Text style={loginScreenStyles.dialogTitle}>{title}</Text>
          <Text style={loginScreenStyles.dialogMessage}>{message}</Text>

          <View style={loginScreenStyles.dialogButtonsContainer}>
            <TouchableOpacity
              style={[loginScreenStyles.dialogButton, loginScreenStyles.dialogCancelButton]}
              onPress={onCancel}
            >
              <Text style={loginScreenStyles.dialogCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[loginScreenStyles.dialogButton, loginScreenStyles.dialogSignUpButton]}
              onPress={onSignUp}
            >
              <Text style={loginScreenStyles.dialogSignUpText}>signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
