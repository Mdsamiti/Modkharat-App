import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X, ArrowUpRight, ArrowDownRight, Edit3, MessageSquare, Mic, Camera,
  Check, ArrowLeft, ImageIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useImagePicker } from '@/hooks/useImagePicker';
import { categoriesApi, transactionsApi } from '@/services/api';
import type { TransactionType, CaptureMethod } from '@/types/models';

export default function AddTransactionScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currency = language === 'en' ? 'SAR' : 'ر.س';

  const { data: catData } = useApi(() => categoriesApi.listCategories(), []);
  const { data: accData } = useApi(() => categoriesApi.listAccounts(), []);

  const categories = catData?.data ?? [];
  const accounts = accData?.data ?? [];

  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [captureMethod, setCaptureMethod] = useState<CaptureMethod | null>(null);
  const [formStep, setFormStep] = useState<'capture' | 'review'>('capture');
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [smsText, setSmsText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Device capture hooks
  const audioRecording = useAudioRecording();
  const imagePicker = useImagePicker();

  // Set default category/account when data loads
  useEffect(() => {
    if (categories.length > 0 && !categoryId) setCategoryId(categories[0].id);
  }, [categories]);
  useEffect(() => {
    if (accounts.length > 0 && !accountId) setAccountId(accounts[0].id);
  }, [accounts]);

  const captureMethods = [
    { id: 'manual' as CaptureMethod, icon: Edit3, label: t('addTransaction.manual'), desc: t('addTransaction.manualDesc') },
    { id: 'sms' as CaptureMethod, icon: MessageSquare, label: t('addTransaction.sms'), desc: t('addTransaction.smsDesc') },
    { id: 'voice' as CaptureMethod, icon: Mic, label: t('addTransaction.voice'), desc: t('addTransaction.voiceDesc') },
    { id: 'scan' as CaptureMethod, icon: Camera, label: t('addTransaction.scan'), desc: t('addTransaction.scanDesc') },
  ];

  /** Poll a job until it completes or fails */
  const pollJob = async (jobId: string, maxAttempts = 20): Promise<void> => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const res = await transactionsApi.getJobStatus(jobId);
      const job = res.data;
      if (job.status === 'completed' && job.transactionId) {
        // Fetch the created draft transaction to populate the form
        const txRes = await transactionsApi.getTransaction(job.transactionId);
        const tx = txRes.data;
        setAmount(String(tx.amount));
        setMerchant(tx.merchant);
        if (tx.date) setDate(tx.date.split('T')[0]);
        return;
      }
      if (job.status === 'failed') {
        throw new Error(job.errorMessage || (language === 'en' ? 'Processing failed' : 'فشلت المعالجة'));
      }
    }
    throw new Error(language === 'en' ? 'Processing timed out' : 'انتهت مهلة المعالجة');
  };

  const handleContinue = async () => {
    setIsProcessing(true);
    try {
      if (captureMethod === 'sms' && smsText) {
        const res = await transactionsApi.submitSms({ rawText: smsText });
        if (res.transaction) {
          setAmount(String(res.transaction.amount));
          setMerchant(res.transaction.merchant);
          if (res.transaction.date) setDate(res.transaction.date.split('T')[0]);
          if (!transactionType) setTransactionType(res.transaction.type);
        }
      } else if (captureMethod === 'voice') {
        const formData = audioRecording.getFormData();
        if (!formData) {
          Alert.alert(
            language === 'en' ? 'No Recording' : 'لا يوجد تسجيل',
            language === 'en' ? 'Please record your voice first.' : 'يرجى تسجيل صوتك أولاً.',
          );
          setIsProcessing(false);
          return;
        }
        const res = await transactionsApi.submitVoice(formData);
        await pollJob(res.data.id);
      } else if (captureMethod === 'scan') {
        const formData = imagePicker.getFormData();
        if (!formData) {
          Alert.alert(
            language === 'en' ? 'No Image' : 'لا توجد صورة',
            language === 'en' ? 'Please take a photo or select an image first.' : 'يرجى التقاط صورة أو اختيار صورة أولاً.',
          );
          setIsProcessing(false);
          return;
        }
        const res = await transactionsApi.submitOcr(formData);
        await pollJob(res.data.id);
      }
      setFormStep('review');
    } catch (err: any) {
      Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Failed to process');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!transactionType || !amount || !merchant) return;
    setIsSaving(true);
    try {
      await transactionsApi.createTransaction({
        type: transactionType,
        amount: Number(amount),
        merchant,
        categoryId: categoryId || undefined,
        accountId: accountId || undefined,
        method: captureMethod || 'manual',
        notes: notes || undefined,
        occurredAt: new Date(date).toISOString(),
      });
      router.back();
    } catch (err: any) {
      Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 1: Select type
  if (!transactionType) {
    return (
      <View className="flex-1 bg-white">
        <View style={{ paddingTop: insets.top }} className="px-4 pb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-800">{t('addTransaction.title')}</Text>
          <Pressable onPress={() => router.back()} className="p-2" hitSlop={8} accessibilityRole="button" accessibilityLabel="Close" style={{ minHeight: 44 }}>
            <X size={22} color="#1e293b" />
          </Pressable>
        </View>

        <View className="flex-1 px-4 pt-6">
          <Text className="text-slate-500 text-center mb-8">{t('addTransaction.selectType')}</Text>
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => setTransactionType('income')}
              className="flex-1 bg-emerald-50 rounded-2xl p-6 items-center active:bg-emerald-100"
              accessibilityRole="button"
              accessibilityLabel={t('addTransaction.income')}
            >
              <View className="w-14 h-14 bg-emerald-500 rounded-full items-center justify-center mb-3">
                <ArrowUpRight size={24} color="#ffffff" />
              </View>
              <Text className="text-emerald-700 font-semibold text-base">{t('addTransaction.income')}</Text>
            </Pressable>
            <Pressable
              onPress={() => setTransactionType('expense')}
              className="flex-1 bg-red-50 rounded-2xl p-6 items-center active:bg-red-100"
              accessibilityRole="button"
              accessibilityLabel={t('addTransaction.expense')}
            >
              <View className="w-14 h-14 bg-red-500 rounded-full items-center justify-center mb-3">
                <ArrowDownRight size={24} color="#ffffff" />
              </View>
              <Text className="text-red-700 font-semibold text-base">{t('addTransaction.expense')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Step 2: Select capture method
  if (!captureMethod) {
    return (
      <View className="flex-1 bg-white">
        <View style={{ paddingTop: insets.top }} className="px-4 pb-3 flex-row items-center">
          <Pressable onPress={() => setTransactionType(null)} className="p-2 -ml-2 mr-2" hitSlop={8} accessibilityRole="button" accessibilityLabel="Back" style={{ minHeight: 44 }}>
            <ArrowLeft size={22} color="#1e293b" />
          </Pressable>
          <Text className="text-lg font-bold text-slate-800">{t('addTransaction.title')}</Text>
          <View className="flex-1" />
          <Pressable onPress={() => router.back()} className="p-2" hitSlop={8} accessibilityRole="button" accessibilityLabel="Close" style={{ minHeight: 44 }}>
            <X size={22} color="#1e293b" />
          </Pressable>
        </View>

        <View className="flex-1 px-4 pt-6">
          <Text className="text-slate-500 text-center mb-8">{t('addTransaction.selectMethod')}</Text>
          <View className="flex-row flex-wrap gap-3">
            {captureMethods.map((m) => {
              const Icon = m.icon;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setCaptureMethod(m.id)}
                  className="bg-slate-50 rounded-2xl p-4 items-center active:bg-slate-100"
                  style={{ width: '47%' }}
                  accessibilityRole="button"
                  accessibilityLabel={m.label}
                >
                  <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-2 shadow-sm">
                    <Icon size={22} color="#059669" />
                  </View>
                  <Text className="text-slate-800 font-medium text-sm">{m.label}</Text>
                  <Text className="text-slate-400 text-xs text-center mt-0.5">{m.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  // Step 3: Capture / Form
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="px-4 pb-3 flex-row items-center border-b border-slate-100">
        <Pressable
          onPress={() => {
            if (formStep === 'review') setFormStep('capture');
            else setCaptureMethod(null);
          }}
          className="p-2 -ml-2 mr-2"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={{ minHeight: 44 }}
        >
          <ArrowLeft size={22} color="#1e293b" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-800">
          {formStep === 'capture' ? t('transactionForm.capture') : t('transactionForm.review')}
        </Text>
        <View className="flex-1" />
        <Pressable onPress={() => router.back()} className="p-2" hitSlop={8} accessibilityRole="button" accessibilityLabel="Close" style={{ minHeight: 44 }}>
          <X size={22} color="#1e293b" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        {formStep === 'capture' && captureMethod === 'manual' && (
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.amount')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              accessibilityLabel={t('transactionForm.amount')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.merchant')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={merchant}
              onChangeText={setMerchant}
              placeholder={t('transactionForm.merchant')}
              placeholderTextColor="#94a3b8"
              accessibilityLabel={t('transactionForm.merchant')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.category')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full ${categoryId === cat.id ? 'bg-emerald-600' : 'bg-slate-100'}`}
                  >
                    <Text className={`text-sm ${categoryId === cat.id ? 'text-white font-medium' : 'text-slate-600'}`}>
                      {language === 'en' ? cat.nameEn : cat.nameAr}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.date')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              accessibilityLabel={t('transactionForm.date')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.notes')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={notes}
              onChangeText={setNotes}
              placeholder={t('transactionForm.notes')}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 80 }}
              accessibilityLabel={t('transactionForm.notes')}
            />
          </View>
        )}

        {formStep === 'capture' && captureMethod === 'sms' && (
          <View>
            <Text className="text-slate-500 text-center mb-4">{t('addTransaction.smsDesc')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={smsText}
              onChangeText={setSmsText}
              placeholder={t('transactionForm.pasteSms')}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={{ minHeight: 120 }}
              accessibilityLabel={t('transactionForm.pasteSms')}
            />
          </View>
        )}

        {formStep === 'capture' && captureMethod === 'voice' && (
          <View className="items-center pt-12">
            <Pressable
              onPress={async () => {
                try {
                  if (audioRecording.isRecording) {
                    await audioRecording.stopRecording();
                  } else {
                    audioRecording.reset();
                    await audioRecording.startRecording();
                  }
                } catch (err: any) {
                  Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Recording failed');
                }
              }}
              className={`w-24 h-24 rounded-full items-center justify-center ${audioRecording.isRecording ? 'bg-red-500' : 'bg-emerald-600'}`}
              accessibilityRole="button"
              accessibilityLabel={audioRecording.isRecording ? t('transactionForm.recording') : t('transactionForm.tapToRecord')}
            >
              <Mic size={36} color="#ffffff" />
            </Pressable>
            <Text className="text-slate-500 mt-4 text-sm">
              {audioRecording.isRecording
                ? `${t('transactionForm.recording')} ${Math.floor(audioRecording.duration / 60)}:${String(audioRecording.duration % 60).padStart(2, '0')}`
                : audioRecording.recordingUri
                  ? (language === 'en' ? 'Recording ready — tap Continue' : 'التسجيل جاهز — اضغط متابعة')
                  : t('transactionForm.tapToRecord')}
            </Text>
            {audioRecording.isRecording && (
              <View className="flex-row gap-1 mt-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    className="w-1.5 bg-red-400 rounded-full"
                    style={{ height: 16 + Math.random() * 24 }}
                  />
                ))}
              </View>
            )}
            {audioRecording.recordingUri && !audioRecording.isRecording && (
              <View className="mt-6 bg-emerald-50 rounded-xl px-6 py-3">
                <Text className="text-emerald-700 font-medium text-sm">
                  {language === 'en' ? `${audioRecording.duration}s recorded` : `تم التسجيل ${audioRecording.duration} ثانية`}
                </Text>
              </View>
            )}
          </View>
        )}

        {formStep === 'capture' && captureMethod === 'scan' && (
          <View className="items-center pt-8">
            {imagePicker.imageUri ? (
              <View className="w-full">
                <Image
                  source={{ uri: imagePicker.imageUri }}
                  className="w-full aspect-[3/4] rounded-2xl"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => imagePicker.reset()}
                  className="mt-3 bg-slate-100 py-2 rounded-xl items-center active:bg-slate-200"
                  accessibilityRole="button"
                >
                  <Text className="text-slate-600 text-sm">
                    {language === 'en' ? 'Retake / Choose another' : 'إعادة التقاط / اختيار أخرى'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="w-full gap-3">
                <Pressable
                  onPress={async () => {
                    try { await imagePicker.takePhoto(); } catch (err: any) {
                      Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Camera failed');
                    }
                  }}
                  className="w-full bg-emerald-50 rounded-2xl p-6 items-center active:bg-emerald-100"
                  accessibilityRole="button"
                  accessibilityLabel={language === 'en' ? 'Take Photo' : 'التقاط صورة'}
                >
                  <Camera size={36} color="#059669" />
                  <Text className="text-emerald-700 font-medium mt-2">
                    {language === 'en' ? 'Take Photo' : 'التقاط صورة'}
                  </Text>
                  <Text className="text-emerald-600/60 text-xs mt-1">{t('transactionForm.pointCamera')}</Text>
                </Pressable>

                <Pressable
                  onPress={async () => {
                    try { await imagePicker.pickFromGallery(); } catch (err: any) {
                      Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Gallery failed');
                    }
                  }}
                  className="w-full bg-slate-50 rounded-2xl p-6 items-center active:bg-slate-100"
                  accessibilityRole="button"
                  accessibilityLabel={language === 'en' ? 'Choose from Gallery' : 'اختيار من المعرض'}
                >
                  <ImageIcon size={36} color="#475569" />
                  <Text className="text-slate-700 font-medium mt-2">
                    {language === 'en' ? 'Choose from Gallery' : 'اختيار من المعرض'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {formStep === 'review' && (
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.amount')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              accessibilityLabel={t('transactionForm.amount')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.merchant')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={merchant}
              onChangeText={setMerchant}
              accessibilityLabel={t('transactionForm.merchant')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.category')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full ${categoryId === cat.id ? 'bg-emerald-600' : 'bg-slate-100'}`}
                  >
                    <Text className={`text-sm ${categoryId === cat.id ? 'text-white font-medium' : 'text-slate-600'}`}>
                      {language === 'en' ? cat.nameEn : cat.nameAr}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.date')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={date}
              onChangeText={setDate}
              accessibilityLabel={t('transactionForm.date')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.notes')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 80 }}
              accessibilityLabel={t('transactionForm.notes')}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {formStep === 'capture' && captureMethod === 'manual' ? (
          <Pressable
            onPress={() => setFormStep('review')}
            className="bg-emerald-600 py-4 rounded-xl items-center active:bg-emerald-700"
            accessibilityRole="button"
            accessibilityLabel={t('transactionForm.review')}
          >
            <Text className="text-white font-semibold">{t('transactionForm.review')}</Text>
          </Pressable>
        ) : formStep === 'capture' ? (
          <Pressable
            onPress={handleContinue}
            disabled={isProcessing}
            className={`py-4 rounded-xl items-center ${isProcessing ? 'bg-emerald-400' : 'bg-emerald-600 active:bg-emerald-700'}`}
            accessibilityRole="button"
            accessibilityLabel={language === 'en' ? 'Continue' : 'متابعة'}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">{language === 'en' ? 'Continue' : 'متابعة'}</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className={`py-4 rounded-xl items-center flex-row justify-center ${isSaving ? 'bg-emerald-400' : 'bg-emerald-600 active:bg-emerald-700'}`}
            accessibilityRole="button"
            accessibilityLabel={t('transactionForm.save')}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Check size={18} color="#ffffff" />
                <Text className="text-white font-semibold ml-2">{t('transactionForm.save')}</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
