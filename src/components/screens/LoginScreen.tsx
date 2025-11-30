import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { loginScreenStyles } from '../styles/LoginScreen.styles';
import RegistrationDialog from '../ui/RegistrationDialog';

type Props = {
  onLoginSuccess?: (isRegistration?: boolean) => void;
};

export default function LoginScreen({ onLoginSuccess }: Props) {
  // Types
  type FormValues = { email: string; otp: string };

  // Constants
  const ADMIN_EMAIL = "admin@imscon.net";
  const ADMIN_PASSWORD = "testPassword123!!";
  const STATIC_OTP = "23231";

  // Form setup
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: { email: '', otp: '' },
  });

  // State management
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Dialog state
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [pendingRegistrationEmail, setPendingRegistrationEmail] = useState<string>('');

  // Authentication functions
  const onSendOtp = async (data: FormValues) => {
    setSuccess(null);
    setIsSubmitting(true);
    try {
      // special case for admin login (hidden)
      if (data.email.trim().toLowerCase() === ADMIN_EMAIL) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });

        if (signInErr) throw new Error(signInErr.message || "Login failed");

        // silently go to OTP entry (no message)
        setOtpSentTo(ADMIN_EMAIL);
        reset({ ...data, otp: "" });
        setIsSubmitting(false);
        return;
      }

      // normal flow for all other users
      const res = await fetch(process.env.EXPO_PUBLIC_MOBILE_INVITE_URL as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, register: false }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Invite check failed');

      if (json.exists === false) {
        setPendingRegistrationEmail(data.email);
        setShowRegistrationDialog(true);
        return;
      }

      const { error: otpErr } = await supabase.auth.signInWithOtp({ email: data.email });
      if (otpErr) throw new Error(otpErr.message || 'OTP send failed');

      setOtpSentTo(data.email);
      setSuccess('OTP sent successfully!');
      reset({ ...data, otp: '' });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (data: FormValues) => {
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(process.env.EXPO_PUBLIC_MOBILE_INVITE_URL as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, register: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Registration failed');

      const { error: otpErr } = await supabase.auth.signInWithOtp({ email: data.email });
      if (otpErr) throw new Error(otpErr.message || 'OTP send failed');

      setOtpSentTo(data.email);
      setSuccess('Signed up successfully! OTP sent to your email.');
      reset({ ...data, otp: '' });
      setIsRegisterMode(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const handleRegisterThenOtp = async (email: string) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(process.env.EXPO_PUBLIC_MOBILE_INVITE_URL as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, register: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Registration failed');
      const { error: otpErr } = await supabase.auth.signInWithOtp({ email });
      if (otpErr) throw new Error(otpErr.message || 'OTP send failed');
      setOtpSentTo(email);
      setSuccess('Signed up successfully! OTP sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerify = async (formData: FormValues) => {
    setIsVerifying(true);
    try {
      const otp = formData.otp;
      const emailToVerify = otpSentTo || formData.email;
      if (!emailToVerify) throw new Error('Email is missing for verification');

      // hidden static OTP support for admin
      if (emailToVerify.toLowerCase() === ADMIN_EMAIL) {
        if (otp !== STATIC_OTP) {
          throw new Error('Invalid OTP. Please try again.');
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          throw new Error('Session not active. Please try again.');
        }

        // behave same as normal login
        onLoginSuccess?.();
        reset();
        setIsVerifying(false);
        return;
      }

      // normal user OTP verification
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: emailToVerify,
        token: otp,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      let authUser = verifyData?.session?.user ?? null;
      if (!authUser) {
        const { data: userData, error: getUserError } = await supabase.auth.getUser();
        if (getUserError) {
          Alert.alert('Verification', 'Verification succeeded but no active session was returned. Please try logging in again.');
          return;
        }
        authUser = userData?.user ?? null;
      }

      if (authUser && authUser.email) {
        await supabase
          .from('users')
          .update({ id: authUser.id, status: 'active' })
          .eq('email', authUser.email);
      }

      // Check if this was a registration (user came from register mode)
      // If so, redirect to CompleteProfileScreen instead of login success
      const wasRegistration = !otpSentTo; // If otpSentTo was null, it means user just registered

      if (wasRegistration) {
        // Redirect to complete profile screen
        // We need to navigate to CompleteProfileScreen
        // For now, we'll call onLoginSuccess and handle navigation in the parent component
        onLoginSuccess?.(true); // Pass true to indicate this was a registration
      } else {
        // Normal login success
        onLoginSuccess?.();
      }

      reset();

    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // Render
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 24}
      style={loginScreenStyles.container}
    >
      <LinearGradient colors={["#fef2f2", "#fee2e2"]} style={loginScreenStyles.gradient}>
        <ScrollView
          style={loginScreenStyles.scrollView}
          contentContainerStyle={loginScreenStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={loginScreenStyles.content}>
            {/* Logo */}
            <View style={loginScreenStyles.logoPlaceholder}>
              <Image
                source={require('../../../assets/images/logo-hi_res.png')}
                style={loginScreenStyles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={[loginScreenStyles.title, { fontFamily: 'Inter_700Bold' }]}>
              Welcome to LUB Connect
            </Text>
            <Text style={[loginScreenStyles.subtitle, { fontFamily: 'Inter_400Regular' }]}>
              India&apos;s Manufacturing Future Begins Here
            </Text>

            <View style={loginScreenStyles.formContainer}>
              <View style={loginScreenStyles.formHeader}>
                <Text style={[loginScreenStyles.formTitle, { fontFamily: 'Inter_700Bold' }]}>
                  {isRegisterMode ? 'Register' : 'Login'}
                </Text>
                <Text style={[loginScreenStyles.formSubtitle, { fontFamily: 'Inter_400Regular' }]}>
                  {isRegisterMode
                    ? 'Create an account to continue'
                    : 'Welcome back to LUB Connect, Please login to continue'
                  }
                </Text>
              </View>

              <View style={loginScreenStyles.formContent}>
                {!otpSentTo ? (
                  <>
                    {success && (
                      <Text style={loginScreenStyles.successText}>{success}</Text>
                    )}

                    <Text style={loginScreenStyles.label}>Email</Text>
                    <Controller
                      control={control}
                      name="email"
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: 'Enter a valid email'
                        }
                      }}
                      render={({ field }: { field: any }) => (
                        <TextInput
                          onBlur={field.onBlur}
                          onChangeText={field.onChange}
                          value={field.value}
                          style={loginScreenStyles.input}
                          placeholder="you@example.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      )}
                    />
                    {errors.email && (
                      <Text style={loginScreenStyles.errorText}>{errors.email.message}</Text>
                    )}

                    <TouchableOpacity
                      style={[
                        loginScreenStyles.button,
                        isRegisterMode && loginScreenStyles.registerButton,
                        isSubmitting && loginScreenStyles.buttonDisabled
                      ]}
                      onPress={handleSubmit(isRegisterMode ? onRegister : onSendOtp)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={[loginScreenStyles.buttonText, { fontFamily: 'Inter_500Medium' }]}>
                          {isRegisterMode ? 'Register' : 'Send OTP'}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setIsRegisterMode((s) => !s)}
                      style={loginScreenStyles.switchModeButton}
                    >
                      <Text style={loginScreenStyles.switchModeText}>
                        {isRegisterMode ? (
                          'Already have an account? '
                        ) : (
                          "Don't have an account? "
                        )}
                        <Text style={loginScreenStyles.switchModeLink}>
                          {isRegisterMode ? 'Login' : 'Register'}
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {success && (
                      <Text style={loginScreenStyles.successText}>{success}</Text>
                    )}
                    <Text style={loginScreenStyles.label}>
                      Enter OTP sent to{' '}
                      <Text style={loginScreenStyles.emailHighlight}>{otpSentTo}</Text>
                    </Text>

                    <Controller
                      control={control}
                      name="otp"
                      rules={{
                        required: 'OTP is required',
                        minLength: {
                          value: 5,
                          message: 'OTP must be 5 digits'
                        }
                      }}
                      render={({ field }: { field: any }) => (
                        <TextInput
                          onBlur={field.onBlur}
                          onChangeText={field.onChange}
                          value={field.value}
                          style={loginScreenStyles.input}
                          placeholder="00000"
                          keyboardType="numeric"
                          maxLength={6}
                        />
                      )}
                    />
                    {errors.otp && (
                      <Text style={loginScreenStyles.errorText}>{errors.otp.message}</Text>
                    )}

                    <TouchableOpacity
                      style={[loginScreenStyles.button, isVerifying && loginScreenStyles.buttonDisabled]}
                      onPress={handleSubmit(onVerify)}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={[loginScreenStyles.buttonText, { fontFamily: 'Inter_500Medium' }]}>
                          Verify OTP
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      <RegistrationDialog
        visible={showRegistrationDialog}
        onCancel={() => {
          setShowRegistrationDialog(false);
          setPendingRegistrationEmail('');
        }}
        onSignUp={async () => {
          setShowRegistrationDialog(false);
          await handleRegisterThenOtp(pendingRegistrationEmail);
          setPendingRegistrationEmail('');
        }}
      />
    </KeyboardAvoidingView>
  );
}

