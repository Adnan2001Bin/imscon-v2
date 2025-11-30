import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
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

  // Animation values
  const [slideAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(1));

  // Dialog state
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [pendingRegistrationEmail, setPendingRegistrationEmail] = useState<string>('');

  // Toggle between login and register with animation
  const toggleMode = () => {
    const screenWidth = Dimensions.get('window').width;
    const isGoingToRegister = !isRegisterMode; // If currently in login mode, going to register

    // Slide out current content with fade
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isGoingToRegister ? -screenWidth : screenWidth, // Slide left for register, right for login
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Toggle mode
      setIsRegisterMode(!isRegisterMode);

      // Reset position and slide in new content
      slideAnim.setValue(isGoingToRegister ? screenWidth : -screenWidth); // Start from opposite side

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0, // Slide to center
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

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
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
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
            {/* Header Section */}
            <View style={loginScreenStyles.header}>
              <View style={loginScreenStyles.logoContainer}>
                <Image
                  source={require('../../../assets/images/lub-karnataka.png')}
                  style={loginScreenStyles.logoImage}
                  resizeMode="contain"
                />
              </View>
              
              <View style={loginScreenStyles.welcomeSection}>
                <Text style={[loginScreenStyles.title, { fontFamily: 'Inter_700Bold' }]}>
                  Welcome to LUB Connect
                </Text>
                <Text style={[loginScreenStyles.subtitle, { fontFamily: 'Inter_400Regular' }]}>
                  India's Manufacturing Future Begins Here
                </Text>
              </View>
            </View>

            {/* Form Card */}
            <Animated.View
              style={[
                loginScreenStyles.formCard,
                {
                  opacity: opacityAnim,
                  transform: [{ translateX: slideAnim }]
                }
              ]}
            >
              {/* Form Header with Mode Toggle */}
              <View style={loginScreenStyles.modeToggleContainer}>
                <Text style={loginScreenStyles.modeTitle}>
                  {isRegisterMode ? 'Create Account' : 'Welcome Back'}
                </Text>
                <Text style={loginScreenStyles.modeToggleText}>
                  {isRegisterMode ?  "Don't have an account? Create one to get started." :'Welcome back to LUB Connect'}
                </Text>
              </View>

              <View style={loginScreenStyles.formContent}>
                {!otpSentTo ? (
                  <>
                    {success && (
                      <View style={loginScreenStyles.successContainer}>
                        <Text style={loginScreenStyles.successText}>{success}</Text>
                      </View>
                    )}

                    <View style={loginScreenStyles.inputContainer}>
                      <Text style={loginScreenStyles.label}>Email address</Text>
                      <Controller
                        control={control}
                        name="email"
                        rules={{
                          required: 'Email is required',
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: 'Enter a valid email address'
                          }
                        }}
                        render={({ field }: { field: any }) => (
                          <TextInput
                            onBlur={field.onBlur}
                            onChangeText={field.onChange}
                            value={field.value}
                            style={[
                              loginScreenStyles.input,
                              errors.email && loginScreenStyles.inputError
                            ]}
                            placeholder="Enter your email"
                            placeholderTextColor="#9ca3af"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                          />
                        )}
                      />
                      {errors.email && (
                        <Text style={loginScreenStyles.errorText}>{errors.email.message}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        loginScreenStyles.primaryButton,
                        isRegisterMode && loginScreenStyles.registerButton,
                        isSubmitting && loginScreenStyles.buttonDisabled
                      ]}
                      onPress={handleSubmit(isRegisterMode ? onRegister : onSendOtp)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text style={[loginScreenStyles.primaryButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
                          {isRegisterMode ? 'Create Account' : 'Send OTP'}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <View style={loginScreenStyles.divider}>
                      <View style={loginScreenStyles.dividerLine} />
                      <Text style={loginScreenStyles.dividerText}>or</Text>
                      <View style={loginScreenStyles.dividerLine} />
                    </View>

                    <TouchableOpacity
                      onPress={toggleMode}
                      style={loginScreenStyles.secondaryButton}
                    >
                      <Text style={loginScreenStyles.secondaryButtonText}>
                        {isRegisterMode
                          ? 'Already have an account? '
                          : "Don't have an account? "
                        }
                        <Text style={loginScreenStyles.secondaryButtonTextBold}>
                          {isRegisterMode
                            ? 'Sign in'
                            : 'Join now'
                          }
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {success && (
                      <View style={loginScreenStyles.successContainer}>
                        <Text style={loginScreenStyles.successText}>{success}</Text>
                      </View>
                    )}
                    
                    <View style={loginScreenStyles.otpHeader}>
                      <Text style={loginScreenStyles.otpTitle}>Enter verification code</Text>
                      <Text style={loginScreenStyles.otpSubtitle}>
                        We sent a code to {' '}
                        <Text style={loginScreenStyles.emailHighlight}>{otpSentTo}</Text>
                      </Text>
                    </View>

                    <View style={loginScreenStyles.inputContainer}>
                      <Text style={loginScreenStyles.label}>Verification code</Text>
                      <Controller
                        control={control}
                        name="otp"
                        rules={{
                          required: 'Verification code is required',
                          minLength: {
                            value: 5,
                            message: 'Code must be 5 digits'
                          }
                        }}
                        render={({ field }: { field: any }) => (
                          <TextInput
                            onBlur={field.onBlur}
                            onChangeText={field.onChange}
                            value={field.value}
                            style={[
                              loginScreenStyles.input,
                              errors.otp && loginScreenStyles.inputError
                            ]}
                            placeholder="Enter 5-digit code"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            maxLength={6}
                            autoComplete="one-time-code"
                          />
                        )}
                      />
                      {errors.otp && (
                        <Text style={loginScreenStyles.errorText}>{errors.otp.message}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        loginScreenStyles.primaryButton,
                        isVerifying && loginScreenStyles.buttonDisabled
                      ]}
                      onPress={handleSubmit(onVerify)}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text style={[loginScreenStyles.primaryButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
                          Verify and Continue
                        </Text>
                      )}
                    </TouchableOpacity>

                  </>
                )}
              </View>
            </Animated.View>

            {/* Footer */}
            <View style={loginScreenStyles.footer}>
              <Text style={loginScreenStyles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={loginScreenStyles.footerLink}>Terms of Service</Text>{' '}
                and acknowledge our{' '}
                <Text style={loginScreenStyles.footerLink}>Privacy Policy</Text>.
              </Text>
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