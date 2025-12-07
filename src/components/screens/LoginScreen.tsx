import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
    // flip mode
    setIsRegisterMode((prev) => !prev);

    // start from slightly lower + transparent
    slideAnim.setValue(16);      // a bit more offset
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1400, // ⬅️ slower
        easing: Easing.out(Easing.cubic), // ⬅️ smoother curve
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1400, // ⬅️ match duration
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
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
      console.log('Starting OTP verification for:', emailToVerify);
      if (!emailToVerify) throw new Error('Email is missing for verification');

      // hidden static OTP support for admin
      if (emailToVerify.toLowerCase() === ADMIN_EMAIL) {
        console.log('Admin login attempt');
        if (otp !== STATIC_OTP) {
          throw new Error('Invalid OTP. Please try again.');
        }

        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Admin session check:', sessionData?.session?.user ? 'Session exists' : 'No session');
        if (!sessionData?.session?.user) {
          throw new Error('Session not active. Please try again.');
        }

        // behave same as normal login
        console.log('Admin login successful, calling onLoginSuccess');
        onLoginSuccess?.();
        reset();
        setIsVerifying(false);
        return;
      }

      // normal user OTP verification
      console.log('Verifying OTP for normal user');
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: emailToVerify,
        token: otp,
        type: 'email',
      });

      if (verifyError) {
        console.error('OTP verification error:', verifyError);
        throw verifyError;
      }

      console.log('OTP verification successful, verifyData:', verifyData);

      let authUser = verifyData?.session?.user ?? null;
      console.log('Auth user from verifyData:', authUser ? 'Found' : 'Not found');

      if (!authUser) {
        console.log('No auth user from verifyData, trying getUser');
        const { data: userData, error: getUserError } = await supabase.auth.getUser();
        if (getUserError) {
          console.error('getUser error:', getUserError);
          Alert.alert('Verification', 'Verification succeeded but no active session was returned. Please try logging in again.');
          return;
        }
        authUser = userData?.user ?? null;
        console.log('Auth user from getUser:', authUser ? 'Found' : 'Not found');
      }

      if (authUser && authUser.email) {
        console.log('Ensuring user record exists for:', authUser.email);

        // First, check if user exists in the database
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id, email, status')
          .eq('email', authUser.email)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking if user exists:', checkError);
        }

        if (!existingUser) {
          console.log('User record not found, creating new user record');
          // Create a new user record with minimal data
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.name || authUser.email.split('@')[0], // Use email prefix as name if no name provided
              role: 'visitor', // Default role
              status: 'active',
              profile_completed: false,
              company_profile_completed: false,
              is_paid: false,
              is_primary: true,
              // Set other fields to null initially
              phone: null,
              designation: null,
              company: null,
              company_id: null,
              linkedin: null,
              industry: null,
              address: null,
              city: null,
              country: null,
              zip_code: null,
              about: null,
              profile_picture: null,
            });

          if (createError) {
            console.error('Error creating user record:', createError);
            throw new Error('Failed to create user account. Please try again.');
          } else {
            console.log('User record created successfully');
          }
        } else {
          console.log('User record exists, updating status to active');
          // User exists, just update status to active
          const { error: updateError } = await supabase
            .from('users')
            .update({ status: 'active' })
            .eq('email', authUser.email);

          if (updateError) {
            console.error('Error updating user status:', updateError);
          } else {
            console.log('User status updated successfully');
          }
        }
      }

      // Check if this was a registration (user came from register mode)
      // If so, redirect to CompleteProfileScreen instead of login success
      const wasRegistration = !otpSentTo; // If otpSentTo was null, it means user just registered
      console.log('Was registration:', wasRegistration);

      if (wasRegistration) {
        // Redirect to complete profile screen
        // We need to navigate to CompleteProfileScreen
        // For now, we'll call onLoginSuccess and handle navigation in the parent component
        console.log('Calling onLoginSuccess with isRegistration=true');
        onLoginSuccess?.(true); // Pass true to indicate this was a registration
      } else {
        // Normal login success
        console.log('Calling onLoginSuccess for normal login');
        onLoginSuccess?.();
      }

      reset();

    } catch (err: any) {
      console.error('Verification failed:', err);
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
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Form Header with Mode Toggle */}
              <View style={loginScreenStyles.modeToggleContainer}>
                <Text style={loginScreenStyles.modeTitle}>
                  {isRegisterMode ? 'Create Account' : 'Welcome Back'}
                </Text>
                <Text style={loginScreenStyles.modeToggleText}>
                  {isRegisterMode ? "Don't have an account? Create one to get started." : 'Welcome back to LUB Connect'}
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