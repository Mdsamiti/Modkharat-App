import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';

export default function SignInScreen() {
  const { t, i18n } = useTranslation();
  const { language, toggleLanguage, setAuthenticated } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const isRTL = language === 'ar';

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = t('auth.errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth.errors.emailInvalid');
    if (!password) newErrors.password = t('auth.errors.passwordRequired');
    else if (password.length < 8) newErrors.password = t('auth.errors.passwordMin');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = () => {
    if (validate()) {
      setAuthenticated(true);
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
    toggleLanguage();
  };

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
          <View className="items-center mb-8 mt-16">
            <View className="w-20 h-20 bg-emerald-600 rounded-3xl items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">م</Text>
            </View>
            <Text className="text-2xl font-bold text-slate-800">
              {language === 'en' ? 'Modkharat' : 'مدخراتي'}
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-6 shadow-lg">
            <Text className="text-2xl font-bold text-slate-800 text-center mb-2">
              {t('auth.welcomeBack')}
            </Text>
            <Text className="text-slate-500 text-center mb-6">
              {t('auth.welcomeSubtitle')}
            </Text>

            {/* Email */}
            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('auth.email')}</Text>
            <View className={`flex-row items-center border rounded-xl px-3 mb-1 ${errors.email ? 'border-red-500' : 'border-slate-200'}`}>
              <Mail size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 py-3 px-2 text-base text-slate-800"
                placeholder={t('auth.email')}
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign={isRTL ? 'right' : 'left'}
                accessibilityLabel={t('auth.email')}
              />
            </View>
            {errors.email && <Text className="text-red-500 text-xs mb-3">{errors.email}</Text>}
            {!errors.email && <View className="mb-3" />}

            {/* Password */}
            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('auth.password')}</Text>
            <View className={`flex-row items-center border rounded-xl px-3 mb-1 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}>
              <Lock size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 py-3 px-2 text-base text-slate-800"
                placeholder={t('auth.password')}
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textAlign={isRTL ? 'right' : 'left'}
                accessibilityLabel={t('auth.password')}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                hitSlop={8}
                style={{ minHeight: 44 }}
              >
                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </Pressable>
            </View>
            {errors.password && <Text className="text-red-500 text-xs mb-3">{errors.password}</Text>}
            {!errors.password && <View className="mb-3" />}

            {/* Forgot Password */}
            <Pressable className="mb-5" accessibilityRole="link">
              <Text className="text-emerald-600 text-sm text-right">{t('auth.forgotPassword')}</Text>
            </Pressable>

            {/* Sign In Button */}
            <Pressable
              onPress={handleSignIn}
              className="bg-emerald-600 py-4 rounded-xl items-center active:bg-emerald-700"
              accessibilityRole="button"
              accessibilityLabel={t('auth.signIn')}
            >
              <Text className="text-white font-semibold text-base">{t('auth.signIn')}</Text>
            </Pressable>

            {/* Switch to Sign Up */}
            <View className="flex-row justify-center mt-5">
              <Text className="text-slate-500">{t('auth.noAccount')} </Text>
              <Pressable onPress={() => router.push('/(auth)/sign-up')} accessibilityRole="link">
                <Text className="text-emerald-600 font-semibold">{t('auth.signUp')}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
