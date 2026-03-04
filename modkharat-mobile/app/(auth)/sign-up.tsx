import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Switch, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { authApi } from '@/services/api';

export default function SignUpScreen() {
  const { t, i18n } = useTranslation();
  const { language, toggleLanguage, setAuthenticated } = useApp();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRTL = language === 'ar';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name) e.name = t('auth.errors.nameRequired');
    if (!email) e.email = t('auth.errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('auth.errors.emailInvalid');
    if (!password) e.password = t('auth.errors.passwordRequired');
    else if (password.length < 8) e.password = t('auth.errors.passwordMin');
    if (password !== confirmPassword) e.confirmPassword = t('auth.errors.passwordMismatch');
    if (!agreeToTerms) e.terms = t('auth.errors.termsRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await authApi.signUp(email, password, name);
      // Auth state listener in AppContext will set isAuthenticated=true
    } catch (err: any) {
      const message = err?.message || t('auth.errors.generic');
      Alert.alert(t('auth.errors.signUpFailed'), message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
    toggleLanguage();
  };

  const renderField = (
    label: string,
    value: string,
    onChangeText: (v: string) => void,
    icon: React.ReactNode,
    errorKey: string,
    options?: { secure?: boolean; showToggle?: boolean; isVisible?: boolean; onToggleVisibility?: () => void; keyboardType?: any }
  ) => (
    <View className="mb-3">
      <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
      <View className={`flex-row items-center border rounded-xl px-3 ${errors[errorKey] ? 'border-red-500' : 'border-slate-200'}`}>
        {icon}
        <TextInput
          className="flex-1 py-3 px-2 text-base text-slate-800"
          placeholder={label}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={options?.secure && !options?.isVisible}
          keyboardType={options?.keyboardType || 'default'}
          autoCapitalize={options?.keyboardType === 'email-address' ? 'none' : 'sentences'}
          textAlign={isRTL ? 'right' : 'left'}
          accessibilityLabel={label}
        />
        {options?.showToggle && (
          <Pressable
            onPress={options.onToggleVisibility}
            accessibilityRole="button"
            accessibilityLabel={options.isVisible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            style={{ minHeight: 44 }}
          >
            {options.isVisible ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
          </Pressable>
        )}
      </View>
      {errors[errorKey] && <Text className="text-red-500 text-xs mt-1">{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <LinearGradient colors={['#ecfdf5', '#f0fdf4', '#ffffff']} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Language Toggle */}
          <Pressable
            onPress={handleToggleLanguage}
            className="absolute top-14 right-6 bg-white/80 px-4 py-2 rounded-full"
            style={{ zIndex: 10 }}
            accessibilityRole="button"
            accessibilityLabel={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            hitSlop={8}
          >
            <Text className="text-sm font-semibold text-slate-700">
              {language === 'en' ? 'عربي' : 'EN'}
            </Text>
          </Pressable>

          {/* Logo */}
          <View className="items-center mb-6 mt-16">
            <View className="w-20 h-20 bg-emerald-600 rounded-3xl items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">م</Text>
            </View>
            <Text className="text-2xl font-bold text-slate-800">
              {language === 'en' ? 'Modkharat' : 'مدخراتي'}
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-6 shadow-lg mb-8">
            <Text className="text-2xl font-bold text-slate-800 text-center mb-2">
              {t('auth.createAccount')}
            </Text>
            <Text className="text-slate-500 text-center mb-6">
              {t('auth.createSubtitle')}
            </Text>

            {renderField(t('auth.name'), name, setName, <User size={18} color="#94a3b8" />, 'name')}
            {renderField(t('auth.email'), email, setEmail, <Mail size={18} color="#94a3b8" />, 'email', { keyboardType: 'email-address' })}
            {renderField(t('auth.password'), password, setPassword, <Lock size={18} color="#94a3b8" />, 'password', {
              secure: true, showToggle: true, isVisible: showPassword, onToggleVisibility: () => setShowPassword(!showPassword),
            })}
            {renderField(t('auth.confirmPassword'), confirmPassword, setConfirmPassword, <Lock size={18} color="#94a3b8" />, 'confirmPassword', {
              secure: true, showToggle: true, isVisible: showConfirmPassword, onToggleVisibility: () => setShowConfirmPassword(!showConfirmPassword),
            })}

            {/* Terms */}
            <View className="flex-row items-center mb-5">
              <Switch
                value={agreeToTerms}
                onValueChange={setAgreeToTerms}
                trackColor={{ false: '#e2e8f0', true: '#6ee7b7' }}
                thumbColor={agreeToTerms ? '#059669' : '#f4f4f5'}
              />
              <Text className="text-sm text-slate-600 ml-2 flex-1">{t('auth.agreeTerms')}</Text>
            </View>
            {errors.terms && <Text className="text-red-500 text-xs mb-3 -mt-3">{errors.terms}</Text>}

            {/* Sign Up Button */}
            <Pressable
              onPress={handleSignUp}
              disabled={isSubmitting}
              className={`py-4 rounded-xl items-center ${isSubmitting ? 'bg-emerald-400' : 'bg-emerald-600 active:bg-emerald-700'}`}
              accessibilityRole="button"
              accessibilityLabel={t('auth.signUp')}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">{t('auth.signUp')}</Text>
              )}
            </Pressable>

            {/* Switch to Sign In */}
            <View className="flex-row justify-center mt-5">
              <Text className="text-slate-500">{t('auth.haveAccount')} </Text>
              <Pressable onPress={() => router.push('/(auth)/sign-in')} accessibilityRole="link">
                <Text className="text-emerald-600 font-semibold">{t('auth.signIn')}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
